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
  fontWeight:"bold",
  textTransform: "uppercase",
  cursor: "pointer"
}



export default function Home() {
  let [loggedIn, setLoggedIn] = useState(netlifyAuth.isAuthenticated)
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

  const syncData = () => {
    if (user) {
      fetch('/.netlify/functions/full-sync', user && {
        headers: {
          Authorization: 'Bearer ' + user.token.access_token
        }
      })
        .then(res => res.json())
        .then(data => console.log(data))
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
            <div>
              <hr />
              <button
                onClick={syncData}
              >
                Syn data
              </button>
              <hr />

            </div>
          ) : null}
        </main>

        {/* <Footer /> */}

        <style jsx>{`
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
