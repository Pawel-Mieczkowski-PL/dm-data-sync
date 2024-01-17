import { useEffect, useState } from 'react'
import netlifyIdentity from 'netlify-identity-widget'
import Head from 'next/head'

import netlifyAuth from '../netlifyAuth.js'




export default function Home() {
  let [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated)
  const [notification, setNotification] = useState(null)
  const user = netlifyIdentity.currentUser();
  const validUser = (user != null)

  // console.log('user', user, validUser)
  // const { user } = netlifyAuth

  useEffect(() => {
    let isCurrent = true
    netlifyAuth.initialize((user) => {
      console.log('isCurrent', isCurrent, user);
      if (isCurrent) {
        setLoggedIn(!!user)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    if (notification) {
      setTimeout(() => setNotification(null), 10000)
    }
  }, [notification])

  const syncData = async () => {
    if (user && validUser) {
      try {
        const url = '/.netlify/functions/full-sync'
        // const url = '/.netlify/functions/test'
        const request = await fetch(url, user && {
          headers: {
            Authorization: 'Bearer ' + user.token.access_token
          }
        })
        const response = await request.json()
        setNotification({
          "statusCode": request.status,
          // "statusCode": 200,
          'body': response
        })
      } catch (err) {
        setNotification({
          "statusCode": 500,
          "body": err
        })
      }

    }
  }

  let login = () => {
    netlifyAuth.authenticate((user) => {
      setLoggedIn(!!user)
    })
  }
  return (
    <>
      <header className='header container'>
        <img src="./dm-logo.svg" alt="design miami logo" width={100} />
        {loggedIn && user && validUser ? (
          <button
            className='button-auth button-auth--singout'
            onClick={() => {
              netlifyAuth.signout(() => {
                setLoggedIn(false)
              })
            }}
          >
            Log out{user?.user_metadata?.full_name ? <span style={{opacity: .6, marginLeft: '10px'}}>{user.user_metadata.full_name}</span> : null}
          </button>
        ) : (
          <button className='button-auth button-auth--login' onClick={login}>Log in</button>
        )}
      </header>
      <Head>
        <title>Data sync</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {loggedIn && user && validUser ? (
          <button
            className='button-sync'
            // style={stylesBtnSync}
            onClick={syncData}
          >
            Data synchronization
          </button>
        ) : null}
      </main>
      <div className={`notification ${notification ? 'notification--active' : ''} notification--${notification?.statusCode === 200 ? 'ok' : 'error'}`}>{notification?.body?.message}</div>

      {/* <Footer /> */}

      <style jsx>{`

        .header {
          display: flex;
          justify-content: space-between;
          padding: 20px;
          margin-bottom: 50px;
        }

        .notification {
          position: fixed;
          padding: 0.75rem 1.25rem;
          margin-bottom: 1rem;
          border: 1px solid transparent;
          border-radius: 0.25rem;
          bottom: 0px;
          right: -100%;
          min-width: 50%;
          transition: all 1s ease-in-out;
        }

        .notification--active {
          right: 0px;
        }

        .notification--ok {
          border: 1px solid rgba(36, 241, 6, 0.46);
          background-color: rgba(7, 149, 66, 0.12156862745098039);
          box-shadow: 0px 0px 2px #259c08;
          color: #0f970c;
          cursor:pointer;
        }

        .notification--ok:hover {
          background-color: rgba(7, 149, 66, 0.35);
        }

        .notification--error {
          border: 1px solid rgba(241, 6, 6, 0.81);
          background-color: rgba(220, 17, 1, 0.16);
          box-shadow: 0px 0px 2px #ff0303;
          color: #ff0303;
          cursor:pointer;
        }

        .notification--error:hover {
          background-color: rgba(220, 17, 1, 0.33);
        }

        .button-sync {
          border: none;
          outline: none;
          color: rgb(255, 255, 255);
          background: #111;
          cursor: pointer;
          position: relative;
          z-index: 0;
          border-radius: 10px;
          min-width: 50vw;
          height: 80px;
          font-size: 50px;
          user-select: none;
          -webkit-user-select: none;
          touch-action: manipulation;
        }
        
        .button-sync:before {
          content: "";
          background: linear-gradient(
            45deg,
            #ff0000,
            #ff7300,
            #fffb00,
            #48ff00,
            #00ffd5,
            #002bff,
            #7a00ff,
            #ff00c8,
            #ff0000
          );
          position: absolute;
          top: -2px;
          left: -2px;
          background-size: 400%;
          z-index: -1;
          filter: blur(5px);
          -webkit-filter: blur(5px);
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          animation: glowing-button-sync 20s linear infinite;
          transition: opacity 0.3s ease-in-out;
          border-radius: 10px;
        }
        
        @keyframes glowing-button-sync {
          0% {
            background-position: 0 0;
          }
          50% {
            background-position: 400% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
        
        .button-sync:after {
          z-index: -1;
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: #222;
          left: 0;
          top: 0;
          border-radius: 10px;
        }


        .button-auth {
          align-items: center;
          background-color: #fff;
          border: 2px solid #000;
          box-sizing: border-box;
          color: #000;
          cursor: pointer;
          display: inline-flex;
          fill: #000;
          font-family: Inter,sans-serif;
          font-size: 16px;
          font-weight: 600;
          height: 48px;
          justify-content: center;
          letter-spacing: -.8px;
          line-height: 24px;
          min-width: 140px;
          outline: 0;
          padding: 0 17px;
          text-align: center;
          text-decoration: none;
          transition: all .3s;
          user-select: none;
          -webkit-user-select: none;
          touch-action: manipulation;
        }

        .button-auth:focus {
          color: #171e29;
        }

        .button-auth.button-auth--login:hover {
          border-color: #06f;
          color: #06f;
          fill: #06f;
        }

        .button-auth.button-auth--singout:hover {
          border-color: #af5252;
          color: #af5252;
          fill: #af5252;
        }

        .button-auth:active {
          border-color: #06f;
          color: #06f;
          fill: #06f;
        }

        @media (min-width: 768px) {
          .button-auth {
            min-width: 170px;
          }
        }

        .container {
          margin: 0 auto;
          max-width: 1200px;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-family: Menlo, Monaco, Lucida Console, Courier New, monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
            Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  )
}
