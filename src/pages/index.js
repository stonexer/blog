import React from "react"
import Particles from "react-particles-js"

import SEO from "../components/seo"
import particlesConfig from "../utils/particlesConfig"
import SpringCard from "../components/springCard"

import * as styles from "./index.module.css"

function Home() {
  const [height, setHeight] = React.useState(2000)

  React.useEffect(() => {
    if (window) {
      setHeight(window.innerHeight)
    }
  }, [])

  return (
    <div className={styles.container}>
      <SEO title="SToneX" />
      <style>
        {`
          html, body {
            height: 100%;
            overflow: hidden;
          }
        `}
      </style>
      <Particles
        params={particlesConfig}
        height={height}
        style={{ display: "block", transform: "translateZ(-600px)" }}
      />
      <div className="content">
        <SpringCard />
      </div>
    </div>
  )
}

export default Home
