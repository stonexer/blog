import React from "react"
import { Link } from "gatsby"
import { useSpring, animated } from "react-spring"

import * as styles from "./index.module.css"

function SpringCard() {
  // We add this ref to card element and use in onMouseMove event ...
  // ... to get element's offset and dimensions.
  const ref = React.useRef()

  // Keep track of whether card is hovered so we can increment ...
  // ... zIndex to ensure it shows up above other cards when animation causes overlap.
  const [isHovered, setHovered] = React.useState(false)

  const [animatedProps, setAnimatedProps] = useSpring(() => ({
    // Array containing [rotateX, rotateY, and scale] values.
    // We store under a single key (xys) instead of separate keys ...
    // ... so that we can use animatedProps.xys.interpolate() to ...
    // ... easily generate the css transform value below.
    xys: [0, 0, 1],
    // Setup physics
    config: { mass: 10, tension: 400, friction: 30, precision: 0.001 },
  }))

  return (
    <animated.div
      ref={ref}
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={({ clientX, clientY }) => {
        // Get mouse x position within card
        const x =
          clientX -
          (ref.current.offsetLeft -
            (window.scrollX || window.pageXOffset || document.body.scrollLeft))

        // Get mouse y position within card
        const y =
          clientY -
          (ref.current.offsetTop -
            (window.scrollY || window.pageYOffset || document.body.scrollTop))

        // Set animated values based on mouse position and card dimensions
        const dampen = 16 // Lower the number the less rotation
        const xys = [
          -(y - ref.current.clientHeight / 2) / dampen, // rotateX
          (x - ref.current.clientWidth / 2) / dampen, // rotateY
          1.2, // Scale
        ]

        // Update values to animate to
        setAnimatedProps({ xys: xys })
      }}
      onMouseLeave={() => {
        setHovered(false)
        // Set xys back to original
        setAnimatedProps({ xys: [0, 0, 1] })
      }}
      style={{
        // If hovered we want it to overlap other cards when it scales up
        zIndex: isHovered ? 2 : 1,
        // Interpolate function to handle css changes
        transform: animatedProps.xys.interpolate(
          (x, y, s) =>
            `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`
        ),
      }}
    >
      <div className={styles.logo} />
      <h1>
        ST<span className={styles.one}>one</span>X
      </h1>
      <div className={styles.pages}>
        <Link to="/blog">Blog</Link>
        <a href="https://github.com/stonexer">Github</a>
      </div>
    </animated.div>
  )
}

export default SpringCard
