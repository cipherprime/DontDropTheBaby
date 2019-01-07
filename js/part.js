(function() {
    function Part(img, size, scale)
    {
        this.Container_constructor();

        this.size = size;
        this.scaleX = this.scaleY = scale;
        this.gravity = gameSettings.gravity * 3;
        var img = applicationData.getResult( img );

        this.bitmap = new createjs.Bitmap( img.src );
        this.bitmap.regX = this.bitmap.regY = size* .5;

        var spin = new SpinComponent();
		    spin.ease = .01;
            spin.targetRotation = 900 + Math.random() * 3000;

        var xVelocity = 30;
            xVelocity = Math.random() * (xVelocity - -xVelocity) + -xVelocity;
        var yVelocity = -50;
            yVelocity = yVelocity + Math.random() * yVelocity;

	    var velocity = new VelocityComponent();
            velocity.friction = .99;
            velocity.velocity = new createjs.Point( xVelocity, yVelocity );

        // var oscillateScale = new OscillateScaleComponent();
        //     oscillateScale.amplitude = new createjs.Point( 1.3,1.3 );
        //     oscillateScale.frequency = 200;
            //oscillateScale.frequency = Math.random() * (oscillateScale.frequency - -oscillateScale.frequency) + -oscillateScale.frequency

        this.AddComponent( spin );
        this.AddComponent( velocity );
        // this.AddComponent( oscillateScale );
        this.SetComponentsUpdate( true );

        this.addChild( this.bitmap );

        this.on("tick", this.OnUpdate, this);
    }

    var p = createjs.extend( Part, createjs.Container );
        p.OnUpdate = function( event )
        {
            var component = this.GetComponent( VelocityComponent );
            var halfWidth = this.size * .5;

            if(this.y >= stage.height * .5 + this.size * 2 )
            {
                this.Destroy();
            }

            if(this.x <= stage.width * -.5 - halfWidth)
            {
                this.x = stage.width * .5 + halfWidth;
            }else if(this.x >= stage.width * .5 + halfWidth)
            {
                this.x = stage.width * -.5 - halfWidth;
            }

            component.velocity.y += this.gravity;
        }
        p.Destroy = function()
        {
            this.SetComponentsUpdate( false );
            this.off("tick", this.OnUpdate, this);
            this.parent.removeChild( this );
        }
    window.Part = createjs.promote( Part, "Container" );
} () );
