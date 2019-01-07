var baby;
var gameTitle;
var textOutput;
var explosions;
var hiscore;
var compass;
var indicator;


var config = {
	startingVelocity: new createjs.Point(0,5),
	babySize: 90,
	hitareaSize: 160,
	babyFriction: .99,
	touchIndicatorSize: 30,
	rotationEase: .01,
	bodyRotationEase: .01,
	hairRotationEase: .03,
	resetTime: 1500,
	hitScale: 3,
	numberScalePop: 8,
	softServeGravity: 0.1,
	fillThreshold: 0.95,

	flexThreshold: 0,

	difficulty: {
		low: {
			min: 0,
			max: 750,
		},
		medium: {
			min: 751,
			max: 1500,
		},
		high: {
			min: 1501,
			max: 2250,
		},
		highest: {
			min: 2251,
			max: 3000,
		}

	}

};


var ChannelMode = {
	SINGLE: "Single",
	DUAL: "Dual"
};

var gameSettings = {
	flexTime: 2,
	deflateTime: 4,
	gravity: 0.2,
	hitForce: 30,
	minStrength: 0,
	maxStrength: 750,
	useCeiling: false,
	channelOneName: "One",
	channelTwoName: "Two",
	channelMode: ChannelMode.DUAL,
}

var currentChannel = 0;

var manifest = [
		// {src:"audio/background.mp3", id: "background"},
		// {src:"audio/woosh.mp3", id: "woosh", data: 1},
		// {src:"audio/explosion.mp3", id: "explosion"},
		// {src:"audio/explosion_hit.mp3", id: "explosionHit"},
		// {src:"audio/firework.mp3", id: "firework"},
		{src:"img/particle.png", id: "particle"},
		{src:"img/toy_1.png", id: "toy_1"},
		{src:"img/toy_2.png", id: "toy_2"},
		{src:"img/toy_3.png", id: "toy_3"},
		// {src:"img/part_1.png", id: "part_1"},
		// {src:"img/part_2.png", id: "part_2"},
		// {src:"img/part_3.png", id: "part_3"},
		// {src:"img/part_4.png", id: "part_4"},
		{src:"img/ball.png", id: "ball"},
		// {src:"img/part_6.png", id: "part_6"},
		// {src:"img/part_7.png", id: "part_7"}
];


var applicationData;
var isGameOver = true;
var canReset = true;
var softServed = false;
var currentGravity = 0;
var hits = 0;
var gameOverTimer = 0;
var clickSound;

function main()
{
	// Setup
	setup();

	// Load Data
	applicationData = new createjs.LoadQueue( false );
	// applicationData.installPlugin(createjs.Sound);
	applicationData.on("complete", applicationReady, this);
	applicationData.on("error", applicationError, this);
	applicationData.loadManifest( manifest );
}

function applicationError( event )
{
	console.log( event.data );
}

function applicationReady( event )
{

	document.ontouchstart = ( mouseDown ).bind( this );
	document.onmousedown = ( mouseDown ).bind( this );

	indicator = new FlexIndicator( 50);

	var spinBaby = new SpinComponent();
		spinBaby.ease = config.rotationEase;
		spinBaby.targetRotation = Math.random() * 360;
	//var translateBaby = new TranslateComponent();
	var velocityBaby = new VelocityComponent();
		velocityBaby.friction = config.babyFriction;

	var babyScale = new OscillateScaleComponent();
		babyScale.amplitude = new createjs.Point( .1,.1);


	var backgroundScale = new OscillateScaleComponent();
		backgroundScale.amplitude = new createjs.Point( .01,.01);
		backgroundScale.frequency = 5;

		gameTitle = new createjs.Text("", "80px Dosis");
		gameTitle.color = "#2e99c0";
		//gameTitle.outline = 10;
		gameTitle.textAlign = "center";
		gameTitle.textBaseline = "middle";
		gameTitle.scaleX = gameTitle.scaleY = 2;

		updateTitle();

		explosions = new createjs.Container();

	var titleContainer = new createjs.Container();
		titleContainer.addChild( gameTitle );
		//titleContainer.AddComponent( titleScale );
		titleContainer.SetComponentsUpdate( true );




	var hitRadius = config.babySize;
	var hitArea = new createjs.Shape();
		hitArea.graphics.beginFill("green").drawCircle(0,0,hitRadius).
			moveTo(0,0).beginFill("red").drawRect(-hitRadius,-hitRadius*.25,hitRadius*2,hitRadius*.5);

		textOutput = new createjs.Text("","20pt Arial", "#000000");
		textOutput.x = textOutput.y = 10;

		baby = new Baby();
		baby.AddComponent( spinBaby );
		baby.AddComponent( velocityBaby );
		// baby.AddComponent( babyScale );
		baby.SetComponentsUpdate( true );
		baby.on("mousedown", babyHit, this);
		baby.y = 1000;

	var offset = new SpringComponent();
		offset.target = baby;


	var hiscorePadding = 10;
	hiscore = new Hiscore();
	hiscore.x = stage.width - hiscorePadding;
	hiscore.y = hiscorePadding;

	container.addChild( indicator );
	container.addChild( titleContainer, explosions, baby ); //,hair


	compass = new createjs.Container();
	var text = new createjs.Text( "^", "80px Dosis", "#FFF");
		text.textAlign = "center";
		text.textBaseline = "middle";
		text.y = 20;

	var bg = new createjs.Shape();
		bg.graphics.beginFill( getRandomColor() ).drawCircle( 0, 0, 25 ).endFill();

	compass.addChild( bg, text );


	// indicator.SetComponentsUpdate(true);
	indicator.y = stage.height/4;

	container.addChild( compass );

	// container.addChild( testBaby );

	stage.addChild( hiscore );
	stage.on("tick", update, this);
	stage.setChildIndex( container, stage.numChildren-1);	// put game on top


	indicator.SetFill(0);
	setupLogic();
}


function setupLogic()
{

		//
		// Rx.Observable.fromEvent( document, "click" )
		//   .take(1)
		//   .subscribe( async event => {
		//     try {
		//         await onStartButtonClick();
		//     } catch (error) {
		//         console.log(error);
		//     }
		//   })

		var debugText = new createjs.Text("debug");
		// container.addChild( debugText );
		debugText.y = -stage.height/2;
		debugText.x = -stage.width/2;

		var space = event => event.key == " ";

		var keyPress = Rx.Observable.fromEvent( window, "keypress" )
			.filter( event => !event.repeat )
			.filter(space);

		var keyUp = Rx.Observable.fromEvent( window, "keyup" )
			.filter(space);

		var tick = Rx.Observable.fromEvent( stage, "tick" );

		keyPress
			.flatMap( () => tick.takeUntil( keyUp ) )
			.subscribe( () => indicator.Increment() );


		keyUp
			.filter( () => indicator.fillAmount > config.fillThreshold )
			.subscribe( event => {
				indicator.Release();
				babyHit();
			} );

		keyUp
			.filter( () => indicator.fillAmount < config.fillThreshold )
			.subscribe( () => indicator.Decrement() )

		var v = Rx.Observable.fromEvent( window, 'value' )
			.map( event => event.detail )
			// .filter( detail => detail.channel == 2);

		var v1 = v
			.filter( detail => detail.channel == 1);

		var v2 = v
			.filter( detail => detail.channel == 2);


		v1.withLatestFrom(v2)
			.subscribe( ([v1, v2]) => debugText.text = `1: ${v1.value}\n2: ${v2.value}`)

			var values = v2;

		values
			.filter( detail => detail.value >= config.flexThreshold )
			.subscribe( () => indicator.Increment() );

		// values
		// 	.filter( detail => detail.value < config.flexThreshold )
		// 	.subscribe( () => indicator.Decrement() );
}




var currentBg = 0;
function changeBkg()
{
		var options = ["drink", "sun", "popsicle", "anchor"];
		var body = document.getElementsByTagName("body")[0];
		body.classList = body.classList.remove( options[currentBg] );

		currentBg = ( currentBg + 1 ) % options.length;
		body.classList.add( options[currentBg] );
}

function babyHit( event )
{

	changeBkg();

	var force = gameSettings.hitForce;
	// var mp = container.globalToLocal( stage.mouseX , stage.mouseY );

	var p = indicator.GetPopPosition();
	var mp = container.globalToLocal( p.x, p.y );


	if( !softServed )
		mp.x += Math.random() * 25 - 50;
	var subtract = mp.subtract(baby.GetPosition());
	var dist = subtract.length();

	if( dist > config.hitareaSize )
		return;

		subtract = subtract.normalized();



	var angle = mp.degreesTo( baby.GetPosition() );
	//var dist = createjs.Point.distance(dist, baby.GetPosition());
	//console.log( dist );

//	var angle = new createjs.Point(mp.x,mp.y).degreesTo( baby.GetPosition() );
	var component = baby.GetComponent( VelocityComponent );
//		component.velocity.y += Math.sin( angle ) * force;
//		component.velocity.x += Math.cos( angle ) * force
	component.velocity.x -= subtract.x * force;
	component.velocity.y -= subtract.y * force;

	component = baby.GetComponent( SpinComponent );
	component.targetRotation += angle + 360;



	// component = hair.GetComponent( SpinComponent );
	// component.targetRotation += angle + 900;

	hits++;

	if( gameSettings.channelMode == ChannelMode.DUAL )
	{
		currentChannel = currentChannel == 0 ? 1 : 0;
		if( currentChannel == 0 )
			indicator.SetChannelOne();
		else if( currentChannel == 1 )
			indicator.SetChannelTwo();
	}

	var flashComp = new FadeComponent();
		flashComp.autoDestroy = true;

	var flash = new createjs.Shape();
		flash.graphics.beginFill("white").drawRect( 0,0,stage.width,stage.height);
		flash.AddComponent( flashComp );
		flash.SetComponentsUpdate( true );
		flash.mouseEnabled = false;

	stage.addChild( flash );

	fireParticles( mp.x, mp.y, 30 );

	//var explosionSound = createjs.Sound.play("firework", {loop:0, volume: 1 ,interrupt: createjs.Sound.INTERRUPT_NONE});


	// HIT SOUND

	updateTitle();
	baby.Hit();

	// check soft serve ice cream
	if( softServed == false)
	{
		softServed == true;
		currentGravity = gameSettings.gravity;
	}
}

function getRandomColor()
{
	var colors = ["#fb5167","#eccd62","#2f99c2"];
	var color = colors[Math.floor(Math.random()*colors.length)];
	return color;
}

function updateTitle()
{
	var color = getRandomColor();
	var scaleAmount;

	gameTitle.color = color;

	if(( canReset == true) && (hits <= 0))
	{
		gameTitle.text = "DON'T\nDROP\nTHE\nBALL!";
		gameTitle.y = -100;
		scaleAmount = 1.1;

		indicator.visible = false;
	}else{
		gameTitle.text = hits.toString();
		gameTitle.y = 0;

		scaleAmount = config.numberScalePop;

		indicator.visible = true;
	}

	// var woosh = createjs.Sound.play("woosh", {loop:0, volume: .15});
	var tween = createjs.Tween.get(gameTitle, {loop: false})
	.to({scaleX: scaleAmount, scaleY: scaleAmount}, 200, createjs.Ease.bounceIn)
	.to({scaleX: 1, scaleY: 1}, 150, createjs.Ease.bounceOut);
}



function mouseDown( event )
{
	resetGame();

	var color = getRandomColor();
	var mp = container.globalToLocal( stage.mouseX , stage.mouseY ) ;
	var size = config.touchIndicatorSize;
	var fade = new FadeComponent();
		fade.autoDestroy = true;
		fade.ease = .8;
	var touch = new createjs.Shape();
		touch.graphics.beginFill(color).drawCircle(0,0,size);
		touch.AddComponent( fade );
		touch.AddComponent( new OscillateScaleComponent() );
		touch.SetComponentsUpdate( true );
		touch.x = mp.x;
		touch.y = mp.y;
	container.addChild( touch );

	indicator.SetFill(0);

	// clickSound = createjs.Sound.play("explosionHit", {loop:0, volume: .2,interrupt: createjs.Sound.INTERRUPT_ANY});
}

function mouseUp( event )
{

}

function onDeviceMotion( event )
{
	var x = event.accelerationIncludingGravity.x;
	var y = event.accelerationIncludingGravity.y;
	var z = event.accelerationIncludingGravity.z;

	textOutput.Debug(x,y,z);
}

function keyPressed( event )
{
	//Keycodes found at http://keycode.info
	if( event.keyCode == 32 )
	{
//		var component = baby.GetComponent( VelocityComponent );
//			component.velocity.y += -20;

		console.log("space bar pressed");
	}
}

function fireParticles( x, y , amount)
{
	for(var i = 0; i < amount; i++)
	{
		var particle = new Particle();
			particle.x = x;
			particle.y = y;

		explosions.addChild( particle );
	}
}

function explodeBaby()
{
	var partsData = [
		// {img: "part_1", size: 128, scale: 1},
		// {img: "part_2", size: 128, scale: 1},
		// {img: "part_3", size: 256, scale: 1},
		// {img: "part_4", size: 128, scale: .5},
		// {img: "part_4", size: 128, scale: 1},
		// {img: "ball", size: 256, scale: 1},
		// {img: "part_6", size: 128, scale: 1},
		// {img: "part_6", size: 128, scale: 1},
		// {img: "part_6", size: 128, scale: .6},
		// {img: "part_6", size: 128, scale: .6},
		// {img: "part_7", size: 256, scale: 1},
		// {img: "part_7", size: 256, scale: .6},
		// {img: "toy_1", size: 128, scale: 1},
		// {img: "toy_1", size: 128, scale: 1},
		// {img: "toy_1", size: 128, scale: 1},
		// {img: "toy_1", size: 128, scale: 1},
		// {img: "toy_2", size: 128, scale: 1},
		// {img: "toy_2", size: 128, scale: 1},
		// {img: "toy_2", size: 128, scale: 1},
		// {img: "toy_2", size: 128, scale: 1},
		// {img: "toy_3", size: 128, scale: 1},
		// {img: "toy_3", size: 128, scale: 1},
		// {img: "toy_3", size: 128, scale: 1},
		// {img: "toy_3", size: 128, scale: 1}
	];
	for(var i = 0; i < partsData.length; i++)
	{
		var partData = partsData[i];
		var part = new Part(partData.img, partData.size, partData.scale);
			part.x = baby.x;
			part.y = stage.height * .5 + partData.size;

		explosions.addChild( part );
	}

	fireParticles( baby.x, stage.height * .5, 10);
}

function gameOverUpdate( event )
{
	isGameOver = true;
	gameOverTimer += 1000 / 60;

	if(gameOverTimer >= config.resetTime)
		gameOver();
}

function gameOver()
{
	hiscore.UpdateScore( hits );
	canReset = true;
	hits = 0;
	gameOverTimer = 0;
	updateTitle();
}

function resetGame()
{
	if( canReset == false)
		return;

	baby.y = stage.height * -.5 - config.babySize * .5;
	baby.x = Math.random() * 50;

	var component = baby.GetComponent( VelocityComponent );
		component.velocity.y = config.startingVelocity.y;
		component.velocity.x = 0;
		component = baby.GetComponent( SpinComponent );
		component.targetRotation = 900 + Math.random() * 3000;

	canReset = false;
	isGameOver = false;
	softServed = false;
	currentGravity = config.softServeGravity;

	currentChannel = 0;

	if( gameSettings.channelMode == ChannelMode.SINGLE )
		indicator.SetSingle();
	else
		indicator.SetChannelOne();

	updateTitle();
}

function update( event )
{
	var component = baby.GetComponent( VelocityComponent );
	var halfWidth = config.babySize * .5;

	indicator.SetPopX( baby.x );

	if(baby.y >= stage.height * .5 + config.babySize * 2 )
	{
		if(isGameOver == false)
		{
			explodeBaby();
			isGameOver = true;
		}else{
			gameOverUpdate( event );
		}
	}

	if(baby.x <= stage.width * -.5 + halfWidth)
	{
		component.velocity.x = - component.velocity.x;
		baby.x = stage.width * -.5 + halfWidth;
		// baby.x = stage.width * .5 + halfWidth;
	}else if(baby.x >= stage.width * .5 - halfWidth)
	{
		// baby.x = stage.width * -.5 - halfWidth;
		component.velocity.x = - component.velocity.x;
		baby.x = stage.width * .5 - halfWidth;
	}


	if( gameSettings.useCeiling && baby.y <= stage.height * -.5 + halfWidth )
	{
		component.velocity.y = -0.2 * component.velocity.y;
		baby.y = stage.height * -.5 + halfWidth;
	}


	compass.x = baby.x;// Math.min( Math.max( -stage.width * .5 + 20, baby.x ), stage.width * .5 - 20 );
	compass.y = -stage.height * .5 + 30;
	compass.visible = baby.y <= stage.height * -.5 - halfWidth;

	component.velocity.y += currentGravity;
	textOutput.Debug( component.velocity.y );

}
