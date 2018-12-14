(function() {
    function Baby(size)
    {
        this.Container_constructor();

        this.size = size;

        var headScale = new OscillateScaleComponent();
            headScale.amplitude = new createjs.Point( .05, .05);
            headScale.frequency = 20;

        var head = new createjs.Bitmap( applicationData.getResult( "ball" ).src );
            head.regX = head.regY = 124;
            head.AddComponent( headScale );
            head.SetComponentsUpdate( true );

        var hitarea = new createjs.Shape();
          hitarea.graphics.beginFill("#FF0000").drawCircle(0,0,config.hitareaSize);

         this.hitArea = hitarea;

        var top = new createjs.Container();
            top.addChild( head );

        this.addChild( top );

    }

    var p = createjs.extend( Baby, createjs.Container );

        p.OnUpdate = function( event )
        {

        }

        p.Hit = function()
        {
          this.mouseEnabled = false;
          var tween = createjs.Tween.get(baby, {loop: false})
          	.to({scaleX: config.hitScale, scaleY: config.hitScale}, 150, createjs.Ease.bounceIn)
          	.to({scaleX: 1, scaleY: 1, mouseEnabled: true}, 150, createjs.Ease.bounceOut);
          	//.call({this.mouseEnabled = true;}, this);
        }
        p.Destroy = function()
        {
            this.SetComponentsUpdate( false );
            // this.off("tick", this.OnUpdate, this);
            this.parent.removeChild( this );
        }
    window.Baby = createjs.promote( Baby, "Container" );
} () );
