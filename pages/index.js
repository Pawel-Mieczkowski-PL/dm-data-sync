import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

import netlifyAuth from '../netlifyAuth.js'

import Header from '@components/Header'
import Footer from '@components/Footer'

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

  useEffect(() => {
    console.log('loggedIn', loggedIn)
  }, [loggedIn])


  const syncData = () => {
    console.log('syncData', user);
    if (user) {
      fetch('/.netlify/functions/full-sync', user && {
        headers: {
          Authorization:  'Bearer ' + user.token.access_token
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
    <div className="container">
      <Head>
        <title>Data sync</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {loggedIn ? (
          <div>
            You're logged in!
            <Link href="/protected">
              the special, members-only space.
            </Link>

            <hr />
            <button
              onClick={syncData}
            >
              Syn data
            </button>
              <hr />
            <button
              onClick={() => {
                netlifyAuth.signout(() => {
                  setLoggedIn(false)
                  setUser(null)
                })
              }}
            >
              Log out.
            </button>
          </div>
        ) : (
          <button onClick={login}>Log in.</button>
        )}
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
  )
}
