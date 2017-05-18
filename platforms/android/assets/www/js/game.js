(function()
{
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var width, height, player, friction, gravity, speed, gamemode, num_lines, action;
var boxes = []
var keys = []
var timer
var timelimit
var speedincrement
var score
var disabled = 1

function reset()
{
	if (localStorage.getItem("difficulty") === null)
	{
		localStorage.setItem('difficulty', "1");
	}
	speed = parseInt(localStorage.getItem('difficulty'));
	time = 0
	timelimit = 600
	speedincrement = 0.5
	action = false;
	boxes = []
	width = $(window).width();
	height = $(window).height();
	score = 0
	canvas.width = width;
	canvas.height = height;
	player = {
		x: width / 2,
		y: height / 3,
		width: 5,
		height: 5,
		speed: 3,
		velX: 0,
		velY: 0,
		jumping: false,
		grounded: false
	}
	friction = 0.8
	gravity = 0.3;
	gamemode = 0;
	num_lines = 10;
	boxes.push(
	{
		x: 0,
		y: player.y + 30,
		width: 1 * width,
		height: 2
	});
	for (var i = 0; i < num_lines; i++)
	{
		add_line();
	}
}

function add_line()
{
	var average_gap = 30
	var max_height_difference = 10
	var average_width = 130
	var previous = boxes[boxes.length - 1]
	boxes.push(
	{
		x: previous.x + previous.width + average_gap * Math.random(),
		y: previous.y + max_height_difference * (1 - 2 * Math.random()),
		width: 15 + average_width * Math.random(),
		height: 2
	});
}

function update()
{
	if (gamemode == 0)
	{
		ctx.font = "30px Arial";
		ctx.fillText("press  to play", 10, 50);
	}
	if (gamemode == 2)
	{
		ctx.font = "30px Arial";
		ctx.fillText("game over", 10, 50);
	}
	if (gamemode == 1)
	{
		score += speed
		time += 1
		if (time > timelimit)
		{
			time = 0
			speed += speedincrement
		}
		// check keys
		if (action)
		{
			// up arrow or space
			if (!player.jumping && player.grounded)
			{
				navigator.vibrate(100)
				player.jumping = true;
				player.grounded = false;
				player.velY = -player.speed * 2;
				action = false
			}
		}
		player.velX *= friction;
		player.velY += gravity;
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = "black";
		ctx.font = "10px Arial";
		ctx.fillText("score: " + score, 0, 15);
		ctx.beginPath();
		player.grounded = false;
		for (var i = 0; i < boxes.length; i++)
		{
			ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
			var dir = colCheck(player, boxes[i]);
			if (dir === "l" || dir === "r")
			{
				player.velX = 0;
				player.jumping = false;
			}
			else if (dir === "b")
			{
				player.grounded = true;
				player.jumping = false;
			}
			else if (dir === "t")
			{
				player.velY *= -1;
			}
		}
		if (player.grounded)
		{
			player.velY = 0;
		}
		player.x += player.velX;
		player.y += player.velY;
		ctx.fill();
		ctx.fillStyle = "red";
		ctx.fillRect(player.x, player.y, player.width, player.height);
		for (var i = 0; i < boxes.length; i++)
		{
			boxes[i].x -= speed
		}
		for (var i = 0; i < boxes.length; i++)
		{
			if (boxes[i].x + boxes[i].width < 0)
			{
				boxes.splice(i, 1);
				add_line()
			}
		}
		if (player.y > height)
		{
			gamemode = 2
			var scores = []
			if (localStorage.getItem("scores") === null)
			{
				scores.push(score)
				localStorage.setItem('scores', JSON.stringify(scores));
			}
			else
			{
				var b = JSON.parse(localStorage.getItem('scores'));
				scores = b.map(Number);
				if (scores.length > 8)
				{
					scores.sort((a, b) => (b - a));
					var min = scores[scores.length - 1]
					if (score > min)
					{
						scores[scores.length - 1] = score
					}
				}
				else
				{
					scores.push(score)
					scores.sort((a, b) => (b - a));
				}
				scores.sort((a, b) => (b - a));
				localStorage.setItem('scores', JSON.stringify(scores));
			}
		}
	}
	requestAnimationFrame(update);
}

function colCheck(shapeA, shapeB)
{
	var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2))
	var vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2))
	var hWidths = (shapeA.width / 2) + (shapeB.width / 2)
	var hHeights = (shapeA.height / 2) + (shapeB.height / 2)
	var colDir = null;
	if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights)
	{
		var oX = hWidths - Math.abs(vX);
		var oY = hHeights - Math.abs(vY);
		if (oX >= oY)
		{
			if (vY > 0)
			{
				colDir = "t";
				shapeA.y += oY;
			}
			else
			{
				colDir = "b";
				shapeA.y -= oY;
			}
		}
		else
		{
			if (vX > 0)
			{
				colDir = "l";
				shapeA.x += oX;
			}
			else
			{
				colDir = "r";
				shapeA.x -= oX;
			}
		}
	}
	return colDir;
}

function action_do()
{
	if (disabled == 0)
	{
		action = true;
		if (gamemode == 0)
		{
			gamemode = 1
		}
		if (gamemode == 2)
		{
			reset()
			gamemode = 0
			disabled = 1
			$.mobile.changePage("#scores");
		}
	}
}
document.body.addEventListener("keydown", action_do);
document.body.addEventListener("touchstart", action_do);
document.body.addEventListener("keyup", function(e)
{
	action = false;
});
document.body.addEventListener("touchstop", function(e)
{
	action = false;
});
window.addEventListener("load", function()
{
	update();
});
reset()