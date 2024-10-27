import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Header = styled.h1`
  width: 800px; /* Match the width of the field */
  text-align: center;
  font-size: 36px; /* Increased font size */
  background-color: lightgreen; /* Suitable background color */
  color: darkgreen;
  margin-bottom: 20px;
  padding: 10px 0;
  border: 10px solid brown; /* Same border style as the field */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5); /* Inlayed shadow */
`;

const CoinCount = styled.div`
  font-size: 24px;
  color: gold;
  margin-bottom: 10px;
`;

const Field = styled.div`
  width: 800px;
  height: 600px;
  background: repeating-linear-gradient(
    45deg,
    green 0,
    green 25px,
    darkgreen 25px,
    darkgreen 50px
  );
  border: 10px solid brown;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5); /* Inlayed shadow */
`;

const Ball = styled.div`
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 290px;
  left: 390px;
  cursor: pointer;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3); /* Add shading */
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Dimple = styled.div`
  width: 2px;
  height: 2px;
  background-color: rgba(200, 200, 200, 0.9);
  border-radius: 50%;
  margin: 1px;
`;

const Hole = styled.div`
  width: 30px;
  height: 30px;
  background-color: black;
  border-radius: 50%;
  position: absolute;
  top: 100px;
  left: 100px;
`;

const FlagPole = styled.div`
  width: 2px;
  height: 50px;
  background-color: black;
  position: absolute;
  top: 50px; /* Adjusted to position above the hole */
  left: 115px; /* Centered with the hole */
`;

const Flag = styled.div`
  width: 20px;
  height: 15px;
  background-color: red;
  position: absolute;
  top: 0;
  left: -20px; /* Adjusted to position the flag to the left of the pole */
`;

const Arrow = styled.div`
  width: 2px;
  background-color: red;
  position: absolute;
  transform-origin: bottom;
`;

const Obstacle = styled.div`
  width: 50px;
  height: 50px;
  background: repeating-linear-gradient(
    45deg,
    #8b4513 0,
    #8b4513 10px,
    #a0522d 10px,
    #a0522d 20px
  );
  border: 2px solid #654321;
  position: absolute;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5); /* Add shading */
`;

const App = () => {
  const [ballPosition, setBallPosition] = useState({ x: 390, y: 290 });
  const [dragging, setDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [arrow, setArrow] = useState({ visible: false, angle: 0, length: 0, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  const [hits, setHits] = useState(0);
  const [coins, setCoins] = useState(0);
  const ballRef = useRef(null);
  const speedRef = useRef(0);

  const MAX_ARROW_LENGTH = 100; // Maximum length of the arrow
  const MAX_SPEED = 15; // Increased maximum speed of the ball

  const obstacles = [
    { x: 200, y: 200 },
    { x: 400, y: 400 },
    { x: 600, y: 300 },
  ];

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartDrag({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const dx = e.clientX - startDrag.x;
      const dy = e.clientY - startDrag.y;
      const length = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_ARROW_LENGTH); // Limit arrow length
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // Rotate by 90 degrees
      setArrow({
        visible: true,
        angle,
        length,
        start: { x: ballPosition.x + 10, y: ballPosition.y + 10 },
        end: { x: ballPosition.x + 10 - (dx / length) * MAX_ARROW_LENGTH, y: ballPosition.y + 10 - (dy / length) * MAX_ARROW_LENGTH }
      });
    }
  };

  const handleMouseUp = (e) => {
    if (dragging) {
      setDragging(false);
      setArrow({ visible: false, angle: 0, length: 0, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
      const dx = startDrag.x - e.clientX;
      const dy = startDrag.y - e.clientY;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_ARROW_LENGTH); // Limit distance
      const angle = Math.atan2(dy, dx);
      const speed = Math.min(distance / 10, MAX_SPEED); // Limit speed
      speedRef.current = speed;
      moveBall(speed, angle);
      setHits(hits + 1);
    }
  };

  const moveBall = (initialSpeed, angle) => {
    let speed = initialSpeed;
    const friction = 0.99; // Reduced friction to make the ball slow down less quickly
    const stopThreshold = 1; // Speed threshold to stop the ball abruptly

    const interval = setInterval(() => {
      setBallPosition((prev) => {
        let newX = prev.x + speed * Math.cos(angle);
        let newY = prev.y + speed * Math.sin(angle);

        if (newX < 0 || newX > 780) {
          angle = Math.PI - angle; // Reflect angle horizontally
        }

        if (newY < 0 || newY > 580) {
          angle = -angle; // Reflect angle vertically
        }

        if (newX < 0) newX = 0;
        if (newX > 780) newX = 780;
        if (newY < 0) newY = 0;
        if (newY > 580) newY = 580;

        // Check for collisions with obstacles
        for (const obstacle of obstacles) {
          if (
            newX + 10 > obstacle.x &&
            newX - 10 < obstacle.x + 50 &&
            newY + 10 > obstacle.y &&
            newY - 10 < obstacle.y + 50
          ) {
            // Determine which side of the obstacle was hit
            if (prev.x + 10 <= obstacle.x || prev.x - 10 >= obstacle.x + 50) {
              angle = Math.PI - angle; // Reflect angle horizontally
            } else {
              angle = -angle; // Reflect angle vertically
            }
            break;
          }
        }

        return { x: newX, y: newY };
      });

      speed *= friction; // Apply friction to slow down the ball
      speedRef.current = speed;

      if (speed < stopThreshold) {
        clearInterval(interval); // Stop the ball abruptly when speed is below the threshold
      }
    }, 16);
  };

  useEffect(() => {
    const ball = ballRef.current;
    ball.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      ball.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, startDrag, ballPosition]);

  useEffect(() => {
    const distanceToHole = Math.sqrt(
      Math.pow(ballPosition.x - 100, 2) + Math.pow(ballPosition.y - 100, 2)
    );
    if(distanceToHole < 10 && !(speedRef.current < 2))  {
      console.log("TO fast")
    }

    if (distanceToHole < 10 && speedRef.current < 2) { // Increased speed threshold to 2
      const earnedCoins = Math.max(10 - hits, 1); // Calculate coins based on hits, minimum 1 coin
      setCoins(coins + earnedCoins);
      alert(`You won in ${hits} hits! You earned ${earnedCoins} coins.`);
      setBallPosition({ x: 390, y: 290 });
      setHits(0);
    }
  }, [ballPosition]);

  return (
    <FieldContainer>
      <CoinCount>Coins: {coins}</CoinCount>
      <Header>Minigolf Fun!</Header>
      <Field>
        <Ball ref={ballRef} style={{ top: ballPosition.y, left: ballPosition.x }}>
          {Array.from({ length: 5 }).map((_, rowIndex) =>
            Array.from({ length: 5 }).map((_, colIndex) => (
              <Dimple key={`${rowIndex}-${colIndex}`} />
            ))
          )}
        </Ball>
        <Hole />
        <FlagPole>
          <Flag />
        </FlagPole>
        {obstacles.map((obstacle, index) => (
          <Obstacle key={index} style={{ top: obstacle.y, left: obstacle.x }} />
        ))}
        {arrow.visible && (
          <Arrow
            style={{
              top: arrow.start.y,
              left: arrow.start.x,
              height: arrow.length,
              transform: `rotate(${arrow.angle}deg)`,
              transformOrigin: `top left`
            }}
          />
        )}
      </Field>
    </FieldContainer>
  );
};

export default App;