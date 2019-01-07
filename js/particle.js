(function() {
    function Particle()
    {
        this.Container_constructor();

        var colors = ["#efd881","#fb5167","#eccd62","#2f99c2"];

        this.gravity = gameSettings.gravity * 3;

        this.size = 30;
        this.size = Math.random() * (this.size  - this.size * .5 ) + this.size * .5 ;

        this.color = colors[Math.floor(Math.random()*colors.length)];
        this.gfx = new createjs.Shape();
        this.gfx.graphics.beginFill(this.color).drawCircle(0,0,this.size);
        // this.gfx.cache(-this.size, -this.size, this.size * 2, this.size * 2);

        var xVelocity = 30;
            xVelocity = Math.random() * (xVelocity - -xVelocity) + -xVelocity;
        var yVelocity = -30;
            yVelocity = yVelocity + Math.random() * (yVelocity - -yVelocity) + -yVelocity;

	    var velocity = new VelocityComponent();
            velocity.friction = .99;
            velocity.velocity = new createjs.Point( xVelocity, yVelocity );

        this.AddComponent( velocity );
        // this.AddComponent( oscillateScale );
        this.SetComponentsUpdate( true );

        this.addChild( this.gfx );

        this.on("tick", this.OnUpdate, this);
    }

    var p = createjs.extend( Particle, createjs.Container );
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
    window.Particle = createjs.promote( Particle, "Container" );
} () );
