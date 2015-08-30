
'use strict';

document.addEventListener("DOMContentLoaded", onLoad, false);

//RAF shim
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     ||  
	  
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function onLoad() {
    var canvas;
    var canvasWidth;
    var canvasHeight;
    var ctx;
    var particleArray = [];
    var numParticles = 500;
    var lastTime = Date.now();
    var thisTime;
    var deltaTime;
    var dist;
    var newRadius;
    var mouse = new Mouse(0, 0);

    function init() {
        canvas = document.querySelector('canvas');
        ctx = canvas.getContext('2d');

        if (canvas && canvas.getContext) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            canvas.addEventListener("mousemove", function(ev) {
                  var mousePos = getMousePos(canvas, ev);
                  mouse.pos.x = mousePos.x;
                  mouse.pos.y = mousePos.y;
            }, false);

            createParticles();
            mainLoop();
        } else {
            alert('Error: unable to get content.');
            return;
        }
    }

    function mainLoop() { 
        thisTime = Date.now();
        deltaTime = thisTime - lastTime;

        setupCanvas(ctx);
        setBoundary(particleArray);
        renderParticles(ctx, deltaTime, particleArray);

        lastTime = thisTime;

        requestAnimationFrame(mainLoop);
    }

    function createParticles() {
		var i = 0;
		
        for (i = 0; i < numParticles; i += 1) {
            particleArray.push(new Particle());
        }
    }

    function getMousePos(canvas, ev) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        var mouseX = ev.clientX - rect.top - root.scrollTop;
        var mouseY = ev.clientY - rect.left - root.scrollLeft;

        return {
          x: mouseX,
          y: mouseY
        };
    }

    function setupCanvas(ctx) {
        ctx.clearRect(0, 0,window.innerWidth, window.innerHeight);
        ctx.fillStyle = '#131629';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function setBoundary(particleArray) {
        for (var i = 0; i < particleArray.length; i += 1) {
            if (particleArray[i].getX() + ( particleArray[i].getRadius() / 2 ) >= canvas.width || 
                particleArray[i].getX() - ( particleArray[i].getRadius() / 2 ) <= 0) {
                particleArray[i].setVX( -particleArray[i].getVX() ); 
            }

            if (particleArray[i].getY() - ( particleArray[i].getRadius() / 2 ) <= 0 || 
                particleArray[i].getY() + ( particleArray[i].getRadius() / 2 ) >= canvas.height) { 
                particleArray[i].setVY( -particleArray[i].getVY() ); 
            }
        }
    }

    function renderParticles(ctx, deltaTime, particleArray) {
		var i;
		var particleLength = particleArray.length
		
        for ( i = 0; i < particleLength; i += 1 ) {
            dist = Vector.distance( particleArray[i].pos, mouse.pos );
            dist = Math.max( Math.min( 15 - (dist / 15), 5), 1 );
            particleArray[i].newRadius = particleArray[i].getRadius() * dist;

            if ( dist < randomRange(5, 15) ) {
                particleArray[i].hue += 0.25 * deltaTime/20;
            }

            ctx.beginPath();
            ctx.arc( particleArray[i].getX() + particleArray[i].newRadius * Math.cos(45),
                     particleArray[i].getY() + particleArray[i].newRadius * Math.sin(45),  
					 particleArray[i].getRadius(),
                     0, 
                     Math.PI * 2,
                     true );
            ctx.fillStyle = 'hsla(' + particleArray[i].hue + ',' 
                                    + particleArray[i].sat + '%,' 
                                    + particleArray[i].lum + '%,' 
                                    + particleArray[i].alpha + 
                                ')';
            ctx.fill();
            ctx.closePath();

            particleArray[i].pos = particleArray[i].pos.add((particleArray[i].vel.multiply(deltaTime/10)));
        }
    }
    
    init();
}

var Mouse = function(x, y) {
    this.pos = new Vector();
    this.pos.x = x;
    this.pos.y = y;
};

var Particle = (function (ctx) {
    function Particle(x, y, vx, vy, radius, mass, colour) {
        var r = randomRange(0, 1);

        if ( typeof(x)      === 'undefined' ) { x = randomRange(1, window.innerWidth);  }
        if ( typeof(y)      === 'undefined' ) { y = randomRange(1, window.innerHeight); }
        if ( typeof(vx)     === 'undefined' ) { vx = randomRange(0, 0.75); 				}
        if ( typeof(vy)     === 'undefined' ) { vy = randomRange(0, 0.75); 				}
        if ( typeof(radius) === 'undefined' ) { radius = randomRange(0.5, 6); 			}
        if ( typeof(colour) === 'undefined' ) { 
			colour = 'hsla(' + this.hue + ',' + this.sat + '%,' + this.lum + '%,' + this.alpha + ')'; 
		}

        this.pos = new Vector();
        this.pos.x = x;
        this.pos.y = y;
        this.vel = new Vector();
        this.vel.x = vx;
        this.vel.y = vy;
        this.radius = radius;
        this.hue = 0;
        this.sat = 100;
        this.lum = 60;
        this.alpha = r;
        this.colour = colour;
    }

    //getters and setters
    Particle.prototype = {
        setX : function(x) {
            this.pos.x = x;
        },
        setY : function(y) {
            this.pos.y = y;
        },
        getX : function() {
            return this.pos.x;
        },
        getY : function() {
            return this.pos.y;
        },
        setVX : function(vx) {
            this.vel.x = vx;
        },
        setVY : function(vy) {
            this.vel.y = vy;
        },
        getVX : function() {
            return this.vel.x;
        },
        getVY : function() {
            return this.vel.y;
        },
        setRadius : function(radius) {
            this.radius = radius;
        },
        getRadius : function() {
            return this.radius;
        },
        setColour : function(colour) {
            this.colour = colour;
        },
        getColour : function() {
            return this.colour;
        }
    };
    return Particle;
})();

//Vector 2D
var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector.prototype = {
        lengthSquared: function(){
            return this.x * this.x + this.y * this.y;
        },
        length: function(){
            return Math.sqrt(this.lengthSquared());
        },  
        add : function (vec) {
            return new Vector( this.x + vec.x, this.y + vec.y );
        },
        subtract : function (vec) {
            return new Vector( this.x - vec.x, this.y - vec.y );
        },
        multiply : function(scalar) {
            return new Vector ( this.x * scalar, this.y * scalar );
        }
    };

    Vector.distance =  function(vec1,vec2){
        return ( vec1.subtract(vec2) ).length(); 
    }

    return Vector;
})();

var randomRange = function(min, max) {
    return ( (Math.random() * (max - min) ) + min );
};