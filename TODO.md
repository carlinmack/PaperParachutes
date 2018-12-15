Carlin 2018.12.10 22.12

- [ ] add footer
- [ ] change licence to be GNU
- [ ] add touch controls
- [ ] change sprites to free sprites
- [ ] set countdown til game starts
- [ ] research how to maintain a real game and a debug game
- [ ] helicoptors should spawn troopers for themselves

----

Carlin 2018.12.09 1.08

- [ ] Serious bug fixing on why the troopers array isn't cleared on restart. I don't think I necessarily have to do it bc there's not that much new code. I suspect the bug is in not clearing everything fully.
- [ ] Secondary to this it is now really important that the troopersSet is always current, otherwise the game will end prematurely. I'm not sure theres a workaround for this problem.
- [ ] Stacking would be really cool and probably not too hard - it might be very similar to the collision code.
- [ ] Parachute falling speed should be slower, but not so slow that you can go from right to left and always hit it you know. There'll be a sweet spot
- [ ] Helis should stop spawing paras when they're hit
- [ ] Press R to restart message should appear
- [ ] If a trooper hits the turret it should be KO, which actually makes the game quite hard bc the turret has such a long sweep. any thoughts?

---
Carlin 2018.12.08 1.28

- [x] Improve the helicopter spawn times so that the max time a user has to wait is like 2 seconds
- [x] Fix removing elements from the array
- [ ] I've maybe found a better way to do the classes... If you do some research on prototype vs class methods in js you'll see that we should probably be doing prototype. This is a big boring shift we'll make at some point but it's not urgent as the game is still nippy
- [ ] Low Priority - Might be nicer to change the turret rotation coordinate system to match the unit circle. No game impact but may make further developments easier. I'll think about it
- [x] Things shouldn't be allowed to be hit off screen !

---
Carlin 2018.12.07 10.45

- [x] Have helicopters randomly spawn
- [x] Sort out removing elements
- [x] Collision between two objects
- [x] Score increasing and decreasing
- [ ] Add error handling for the turret movement to restrict movement - I think it maybe possible to jump over the boundary so I want to write a condition that it will go back within the range
- [x] Sort file structure so that pictures are in a directory
- [x] Extract js to a different file
- [ ] Scroll wheel controls
- [ ] investigate how things are drawn frame by frame and see if we need to do .onload for each image
- [ ] Have turret extend from bullet maybe since they have the same display method ? [I might investigate how to do the conservatory thing where you just use that method]
- [x] Find a way to flip helicopter sprite with the same file
- [ ] Adapt canvas sizing 





