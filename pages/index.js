import { useEffect, useState } from 'react'
import Head from 'next/head'

import netlifyAuth from '../netlifyAuth.js'


const stylesHeader = {
  display: "flex",
  justifyContent: "space-between",
  padding: '20px'
}

const stylesBtnAuth = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: '20px',
  background: "none",
  height: "40px",
  border: "0.5px solid black",
  fontWeight: "bold",
  textTransform: "uppercase",
  cursor: "pointer"
}

const stylesBtnSync = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: '20px',
  background: "none",
  height: "80px",
  minWidth: "50vw",
  border: "0.5px solid black",
  fontWeight: "bold",
  textTransform: "uppercase",
  cursor: "pointer",
  fontSize: "40px",
  borderRadius: "20px"
}



export default function Home() {
  let [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated)
  const [notification, setNotification] = useState(null)
  const { user } = netlifyAuth

  useEffect(() => {
    let isCurrent = true
    netlifyAuth.initialize((user) => {
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
      setTimeout(() => setNotification(null), 5000)
    }
  }, [notification])

  const syncData = async () => {
    if (user) {
      try {
        const request = await fetch('/.netlify/functions/full-sync', user && {
          headers: {
            Authorization: 'Bearer ' + user.token.access_token
          }
        })
        const response = await request.json()
        setNotification({
          "statusCode": request.statusCode,
          'message': response
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
      <header style={stylesHeader}>
        <img src="./dm-logo.svg" alt="design miami logo" width={100} />
        {loggedIn ? (
          <button
            style={stylesBtnAuth}
            onClick={() => {
              netlifyAuth.signout(() => {
                setLoggedIn(false)
              })
            }}
          >
            Log out
          </button>
        ) : (
          <button style={stylesBtnAuth} onClick={login}>Log in</button>
        )}
      </header>
      <div className="container">
        <Head>
          <title>Data sync</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          {loggedIn ? (
            <button
              style={stylesBtnSync}
              onClick={syncData}
            >
              Syn data
            </button>
          ) : null}
        </main>
        {notification ? <div className={`notification notification--${notification?.statusCode === 200 ? 'ok' : 'error'}`}>{notification?.body?.message}</div> : null}

        {/* <Footer /> */}

        <style jsx>{`
        .notification {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 60px;
          position: fixed;
          bottom: 0px;
          border-top: 2px solid;
          color: #fff;
        }

        .notification--ok {
          background: #83c552;
          border-top-color: #a5d5a5;
        }

        .notification--error {
          background: #d53b4f;
          border-top-color: #970002;
        }


        .container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
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
      </div>
    </>
  )
}
