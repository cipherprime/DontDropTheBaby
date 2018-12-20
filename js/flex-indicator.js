(function() {
    function FlexIndicator(size)
    {
        this.Container_constructor();

        // var colors = ["#fb5167","#eccd62","#2f99c2"];
        var line = new createjs.Shape();
        var fill = new createjs.Shape();
        var color = getRandomColor();

        line.graphics.beginStroke( color )
          .setStrokeStyle( 3, "round" )
          .setStrokeDash([10,10], 0)
          .drawRect(-stage.width, 0, stage.width * 2, stage.height );

        fill.graphics.beginFill( color )
          .drawRect(-stage.width, 0, stage.width * 2, stage.height );

        var fillContainer = new createjs.Container();

        fillContainer.addChild( line, fill );

        var mkText = function( color )
        { var text = new createjs.Text("FLEX", "50px Dosis", color);
          text.textAlign = "center";
          text.textBaseline = "middle";


        var scale = new OscillateScaleComponent();
          scale.amplitude = new createjs.Point( .2, .2 );
          scale.frequency = 5;
        text.AddComponent( scale );
        text.SetComponentsUpdate( true );
        return text;
      }

      var whiteText = mkText( "#FFF" );
      var colorText = mkText( color );

        colorText.y = whiteText.y = stage.height/8;

        var mask = new createjs.Shape();
        mask.graphics.beginFill( "#F0F" )
          .drawRect(-stage.width, 0, stage.width * 2, stage.height );

          this.textMask = mask;

        whiteText.mask = mask

        this.popIndicator = new createjs.Shape();
        // this.popIndicator.graphics.beginFill("#000").drawCircle(0, 0, 10);

        this.fill = fill;
        this.fillContainer = fillContainer;
        this.fillContainer.addChild( this.popIndicator );
        this.addChild( colorText, fillContainer, whiteText );

        this.texts = [ whiteText, colorText ];

        stage.on("tick", this.OnUpdate, this );

        this.displayAmount = 0;
        this.fillAmount = 0;
    }

    var p = createjs.extend( FlexIndicator, createjs.Container );

        p.OnUpdate = function( event )
        {
          this.fillContainer.rotation = 5 * Math.sin( .003 * event.timeStamp );
          this.textMask.rotation = 5 * Math.sin( .003 * event.timeStamp );

          var pt = this.fillContainer.localToLocal( this.fill.x, this.fill.y, this );
          this.textMask.x = pt.x;
          this.textMask.y = pt.y;

          this.displayAmount = createjs.Math.lerp( this.displayAmount, this.fillAmount, 0.6 );
          this.fill.y = createjs.Math.lerp( stage.height/4 + 60, -2, this.displayAmount );

          var isFull = this.fillAmount >= config.fillThreshold;

          this.texts.forEach( text => text.text = isFull ? "RELEASE!" : "FLEX" );

          this.texts.map( text => text.GetComponent( OscillateScaleComponent ) )
            .forEach( scale => scale.frequency = isFull ? 20 : 5 );

        }

        p.Hit = function()
        {

        }

        p.SetPopX = function( x )
        {
          this.popIndicator.x = createjs.Math.lerp( this.popIndicator.x, x, 0.3);
        }

        p.GetPopPosition = function()
        {
          return this.fillContainer.localToGlobal( this.popIndicator.x, this.popIndicator.y );
        }

        p.Release = function()
        {
          this.SetFill(0);
        }

        p.Destroy = function()
        {
            this.SetComponentsUpdate( false );
            this.parent.removeChild( this );
        }

        p.SetFill = function( signal )
        {

          this.fillAmount = createjs.Math.clamp( signal, 0, 1 );

        }

        p.Increment = function()
        {
          this.SetFill( this.fillAmount + config.flexTime / 60 );
        }

        p.Decrement = function()
        {
          this.SetFill( this.fillAmount - config.deflateTime / 60 );
        }

    window.FlexIndicator = createjs.promote( FlexIndicator, "Container" );
} () );
