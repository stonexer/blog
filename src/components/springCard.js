import React from "react"
import { Link } from "gatsby"
import { useSpring, animated } from "react-spring"

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
    <>
      <style>
        {`.card {
  position: fixed;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 480px;
  height: 480px;
  border-radius: 16px;
  margin-left: -240px;
  margin-top: -240px;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  color: rgba(255, 255, 255, 0.96);
}

.card:hover #logo {
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.48);
}

#logo {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  background: #000;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.48);
  transition: box-shadow 0.4s;
  will-change: transform;
}

#logo:before {
  content: '>';
  position: absolute;
  top: 8px;
  left: 16px;
  font-size: 24px;
  font-weight: bolder;
}

#logo:after {
  content: '_';
  position: absolute;
  top: 8px;
  left: 36px;
  font-size: 24px;
  font-weight: bolder;
  animation-name: underscore;
  animation-iteration-count: infinite;
  animation-duration: 2000ms;
  animation-timing-function: step-start;
}

@keyframes underscore {
  0% {
    color: #000;
  }
  50% {
    color: #fff;
  }
  100% {
    color: #000;
  }
}

h1 {
  line-height: 32px;
  margin: unset;
  margin-block-start: 0.67em;
  margin-block-end: 0.67em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding: unset;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 2px;
  font-family: unset;
  text-rendering: unset;
}

.one {
  opacity: 0.4;
}

.pages {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.pages a {
  padding: 0 4px;
  text-decoration: none;
  transition: color 0.2s ease;
  box-shadow: none;
  color: rgba(255, 255, 255, 0.72);
}

a:hover {
  color: #999;
}
`}
      </style>
      <animated.div
        ref={ref}
        className="card"
        onMouseEnter={() => setHovered(true)}
        onMouseMove={({ clientX, clientY }) => {
          // Get mouse x position within card
          const x =
            clientX -
            (ref.current.offsetLeft -
              (window.scrollX ||
                window.pageXOffset ||
                document.body.scrollLeft))

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
        <div id="logo" />
        <h1>
          ST<span className="one">one</span>X
        </h1>
        <div className="pages">
          <Link to="./blog">Blog</Link>
          <a href="https://github.com/stonexer">Github</a>
        </div>
      </animated.div>
    </>
  )
}

export default SpringCard
