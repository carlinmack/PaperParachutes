Carlin 2018.12.08 1.28

- [ ] Improve the helicopter spawn times so that the max time a user has to wait is like 2 seconds
- [ ] Fix removing elements from the array
- [ ] I've maybe found a better way to do the classes... If you do some research on prototype vs class methods in js you'll see that we should probably be doing prototype. This is a big boring shift we'll make at some point but it's not urgent as the game is still nippy
- [ ] Low Priority - Might be nicer to change the turret rotation coordinate system to match the unit circle. No game impact but may make further developments easier. I'll think about it
- [ ] Things shouldn't be allowed to be hit off screen !

---
Carlin 2018.12.07 10.45

- [x] Have helicopters randomly spawn
- [x] Sort out removing elements
- [x] Collision between two objects
- [ ] Score increasing and decreasing
- [ ] Add error handling for the turret movement to restrict movement - I think it maybe possible to jump over the boundary so I want to write a condition that it's within the range
- [x] Sort file structure so that pictures are in a directory
- [ ] Extract js to a different file
- [ ] Scroll wheel controls
- [ ] investigate how things are drawn frame by frame and see if we need to do .onload for each image
- [ ] Have turret extend from bullet maybe since they have the same display method ? [I might investigate how to do the conservatory thing where you just use that method]
- [x] Find a way to flip helicopter sprite with the same file
- [ ] Adapt canvas sizing 
