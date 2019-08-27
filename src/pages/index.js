import React from "react"
import Particles from "react-particles-js"

import particlesConfig from "../utils/particlesConfig"
import SpringCard from "../components/springCard"

import * as styles from "./index.module.css"

function Home() {
  const [height, setHeight] = React.useState(1000)

  React.useEffect(() => {
    if (window) {
      setHeight(window.innerHeight)
    }
  }, [])

  return (
    <div className={styles.container}>
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
