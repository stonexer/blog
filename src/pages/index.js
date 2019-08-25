import React from "react"
import Particles from "react-particles-js"

import particlesConfig from "../utils/particlesConfig"
import SpringCard from "../components/springCard"

function Home() {
  return (
    <>
      <style>
        {`
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  padding: 0;
  margin: 0;
  font-family: 'avenir next', avenir, -apple-system, BlinkMacSystemFont, 'helvetica neue', helvetica,
    ubuntu, roboto, noto, 'segoe ui', arial, sans-serif;
  overflow: hidden;
}
`}
      </style>
      <div
        style={{
          position: "relative",
          backgroundColor: "#1e282f",
          padding: 0,
          margin: 0,
          overflow: "hidden",
          boxSizing: "border-box",
          fontFamily:
            "avenir next,avenir,-apple-system,BlinkMacSystemFont,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif",
        }}
      >
        <Particles
          params={particlesConfig}
          height={window.innerHeight}
          style={{ display: "block" }}
        />
        <div className="content">
          <SpringCard />
        </div>
      </div>
    </>
  )
}

export default Home
