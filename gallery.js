(function( $, undefined ) {
	
	/*
	 * Gallery object.
	 */
	$.Gallery = function( options, element ) {
	
		this.$el	= $( element );
		this._init( options );
		
	};

	
	$.Gallery.defaults 		= {
        typeo       : 1,
		current		: 0,	// index of current item
		autoplay	: false,// slideshow on / off
		interval	: 2000,  // time between transitions
		rotate		: 45,
		width		: 217,
        distance    : 2/3,
    };
	
	$.Gallery.prototype 	= {
		_init 				: function( options ) {
			
			this.options 		= $.extend( true, {}, $.Gallery.defaults, options );
			
			// support for 3d / 2d transforms and transitions
			this.support3d		= Modernizr.csstransforms3d;
			this.support2d		= Modernizr.csstransforms;
			this.supportTrans	= Modernizr.csstransitions;
			
			this.$wrapper		= this.$el.find('.dg-wrapper');
			this.$container		= this.$el;
			
			this.$items			= this.$wrapper.children();
			this.itemsCount		= this.$items.length;
			
			this.$nav			= this.$el.find('nav');
			this.$navPrev		= this.$nav.find('.dg-prev');
			this.$navNext		= this.$nav.find('.dg-next');

            this.$lastUpdateTime = (new Date()).getTime();
			
			// minimum of 3 items
			if( this.itemsCount < 3 ) {
					
				this.$nav.remove();
				return false;
			
			}	
			
			this.current		= this.options.current;
			
			this.isAnim			= false;
			
			this.$items.css({
				'opacity'	: 0,
				'visibility': 'hidden'
			});
			

			
			this._galleryZ = parseInt(Math.cos(this.options.rotate*0.017453293)*(this.options.width/2)) + 20;
			this._width = this.options.width*this.options.distance;
			this._rotate = this.options.rotate;

			this._validate();
			
			this._layout();
			
			// load the events
			this._loadEvents();
			
			// slideshow
			if( this.options.autoplay ) {
			
				this._startSlideshow();
			
			}

			
			
		},
		_validate			: function() {
		
			if( this.options.current < 0 || this.options.current > this.itemsCount - 1 ) {
				
				this.current = 0;
			
			}	
		
		},
		_layout				: function() {
			
			// current, left and right items
			this._setItems();
			
			
			this.$rightItm.css( this._getCoordinates('right') );
			this.$leftItm.css( this._getCoordinates('left') );
			this.$currentItm.css( this._getCoordinates('center') );		
		},
		_setItems			: function() {
			
			this.$items.removeClass('dg-center');
			
			this.$currentItm	= this.$items.eq( this.current );
			this.$leftItm		= ( this.current === 0 ) ? this.$items.eq( this.itemsCount - 1 ) : this.$items.eq( this.current - 1 );
			this.$rightItm		= ( this.current === this.itemsCount - 1 ) ? this.$items.eq( 0 ) : this.$items.eq( this.current + 1 );
			
			if( !this.support3d && this.support2d && this.supportTrans ) {
			
				this.$items.css( 'z-index', 1 );
				this.$currentItm.css( 'z-index', 999 );
			
			}
			
			// next & previous items
			if( this.itemsCount > 3 ) {
			
				// next item
				this.$nextItm		= ( this.$rightItm.index() === this.itemsCount - 1 ) ? this.$items.eq( 0 ) : this.$rightItm.next();
				this.$nextItm.css( this._getCoordinates('outright') );
				
				// previous item
				this.$prevItm		= ( this.$leftItm.index() === 0 ) ? this.$items.eq( this.itemsCount - 1 ) : this.$leftItm.prev();
				this.$prevItm.css( this._getCoordinates('outleft') );
			
			}
			
		},
		_loadEvents			: function() {
			
			var _self	= this;
			
			this.$navPrev.on( 'click.gallery', function( event ) {
				
				if( _self.options.autoplay ) {
				
					clearTimeout( _self.slideshow );
					//_self.options.autoplay	= false;
                    _self._navigate('prev');
                    _self._startSlideshow();
				}  else {
                    _self._navigate('prev');
                }
				return false;
				
			});
			
			this.$navNext.on( 'click.gallery', function( event ) {
				
				if( _self.options.autoplay ) {
				
					clearTimeout( _self.slideshow );
					//_self.options.autoplay	= false;
                    _self._navigate('next');
                    _self._startSlideshow();
                    
				
				} else {
                    _self._navigate('next');
                }
				return false;
				
			});

			this.$items.on("click.gallery", function(event){
                
                
            });

			this.$wrapper.on( 'webkitTransitionEnd.gallery transitionend.gallery OTransitionEnd.gallery', function( event ) {
				
				_self.$currentItm.addClass('dg-center');
				_self.$items.removeClass('dg-transition');
				_self.isAnim	= false;
				
			});
			var touch = {};
			this.$container.on('touchstart mousedown', function(e){
                e.preventDefault();
		        touch = {};
				if(e.type == "mousedown" ) {
					touch.x1 = e.x;
		        	touch.y1 = e.y;
				} else {
		        	touch.x1 = e.touches[0].pageX;
		        	touch.y1 = e.touches[0].pageY;
				}
		    }).on('touchmove mousemove', function(e) {
		        if(e.type == "mousemove" ) {
					touch.x2 = e.x;
		        	touch.y2 = e.y;
				} else {
		        	touch.x2 = e.touches[0].pageX;
		        	touch.y2 = e.touches[0].pageY;
				}
			}).on('touchend mouseup', function(e){
		        var dir = Math.abs(touch.x1 - touch.x2) >=
		              Math.abs(touch.y1 - touch.y2) ? (touch.x1 - touch.x2 > 0 ? 'Left' : 'Right') : (touch.y1 - touch.y2 > 0 ? 'Up' : 'Down');;
		        if(dir == "Left") {
		        } else if(dir == "Right") {               
					_self._navigate('prev');
		        }

			});
			
		},
		_getCoordinates		: function( position ) {
			
			if( this.support3d && this.supportTrans ) {
				var _transforml = 'translateX(-'+this._width+'px) translateZ(-'+this._galleryZ+'px) rotateY('+this._rotate+'deg)';
				var _transformr = 'translateX('+this._width+'px) translateZ(-'+this._galleryZ+'px) rotateY(-'+this._rotate+'deg)';
				var _transformlo = 'translateX(-'+(this._width*5/2)+'px) translateZ(-'+(this._galleryZ+50)+'px) rotateY('+this._rotate+'deg)';
				var _transformro = 'translateX('+(this._width*5/2)+'px) translateZ(-'+(this._galleryZ+50)+'px) rotateY(-'+this._rotate+'deg)';
				switch( position ) {
					case 'outleft':
						return {
							'-webkit-transform'	: _transformlo,
							'-moz-transform'	: _transformlo,
							'-o-transform'		: _transformlo,
							'-ms-transform'		: _transformlo,
							'transform'		    : _transformlo,
							'z-index'			: 1,
							'opacity'			: 0,
							'visibility'		: 'hidden'
						};
						break;
					case 'outright':
						return {
							'-webkit-transform'	: _transformro,
							'-moz-transform'	: _transformro,
							'-o-transform'		: _transformro,
							'-ms-transform'		: _transformro,
							'transform'		    : _transformro,
							'z-index'			: 1,
							'opacity'			: 0,
							'visibility'		: 'hidden'
						};
						break;
					case 'left':
						return {
							'-webkit-transform'	: _transforml,
							'-moz-transform'	: _transforml,
							'-o-transform'		: _transforml,
							'-ms-transform'		: _transforml,
							'transform'		    : _transforml,
							'z-index'			: 1,
							'opacity'			: 1,
							'visibility'		: 'visible'
						};
						break;
					case 'right':
						return {
							'-webkit-transform'	: _transformr,
							'-moz-transform'	: _transformr,
							'-o-transform'		: _transformr,
							'-ms-transform'		: _transformr,
							'transform'		    : _transformr,
							'z-index'			: 1,
							'opacity'			: 1,
							'visibility'		: 'visible'
						};
						break;
					case 'center':
						return {
							'-webkit-transform'	: 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'-moz-transform'	: 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'-o-transform'		: 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'-ms-transform'		: 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'transform'			: 'translateX(0px) translateZ(0px) rotateY(0deg)',
							'z-index'			: 999,
							'opacity'			: 1,
							'visibility'		: 'visible'
						};
						break;
				};
			
			}
			else if( this.support2d && this.supportTrans ) {
				
				var _transforml = 'translateX(-'+this._width+'px)  scale(0.7)';
				var _transformr = 'translateX('+this._width+'px)  scale(0.7)';
				switch( position ) {
					case 'outleft':
						return {
							'-webkit-transform'	: _transforml,
							'-moz-transform'	: _transforml,
							'-o-transform'		: _transforml,
							'-ms-transform'		: _transforml,
							'transform'			: _transforml,
							'z-index'			: 1,
							'opacity'			: 0,
							'visibility'		: 'hidden'
						};
						break;
					case 'outright':
						return {
							'-webkit-transform'	: _transformr,
							'-moz-transform'	: _transformr,
							'-o-transform'		: _transformr,
							'-ms-transform'		: _transformr,
							'transform'			: _transformr,
							'z-index'			: 1,
							'opacity'			: 0,
							'visibility'		: 'hidden'
						};
						break;
					case 'left':
						return {
							'-webkit-transform'	: _transforml,
							'-moz-transform'	: _transforml,
							'-o-transform'		: _transforml,
							'-ms-transform'		: _transforml,
							'transform'			: _transforml,
							'z-index'			: 1,
							'opacity'			: 1,
							'visibility'		: 'visible'
						};
						break;
					case 'right':
						return {
							'-webkit-transform'	: _transformr,
							'-moz-transform'	: _transformr,
							'-o-transform'		: _transformr,
							'-ms-transform'		: _transformr,
							'transform'			: _transformr,
							'z-index'			: 1,
							'opacity'			: 1,
							'visibility'		: 'visible'
						};
						break;
					case 'center':
						return {
							'-webkit-transform'	: 'translate(0px) scale(1)',
							'-moz-transform'	: 'translate(0px) scale(1)',
							'-o-transform'		: 'translate(0px) scale(1)',
							'-ms-transform'		: 'translate(0px) scale(1)',
							'transform'			: 'translate(0px) scale(1)',
							'z-index'			: 999,
							'opacity'			: 1,
							'visibility'		: 'visible'
						};
						break;
				};
			
			}
			else {
			
				switch( position ) {
					case 'outleft'	: 
					case 'outright'	: 
					case 'left'		: 
					case 'right'	:
						return {
							'opacity'			: 0,
							'visibility'		: 'hidden'
						};
						break;
					case 'center'	:
						return {
							'opacity'			: 1,
							'visibility'		: 'visible'
						};
						break;
				};
			
			}
		
		},
		_navigate			: function( dir ) {

            var currentTime = (new Date()).getTime();

            if (currentTime - this.$lastUpdateTime > 1000) {
                this.isAnim = false;
            }
			
			if( this.supportTrans && this.isAnim ) {
                // alert("isAnim is true");
				return false;
            }

            this.$lastUpdateTime = currentTime;
				
			this.isAnim	= true;
			

			switch( dir ) {
			
				case 'next' :
					
					this.current	= this.$rightItm.index();
					
					// right item moves to the center
					this.$rightItm.addClass('dg-transition').css( this._getCoordinates('center') );

					// current item moves left
					this.$currentItm.addClass('dg-transition').css( this._getCoordinates('left') );
					
						
					
					// next item moves to the right
					if( this.$nextItm ) {
						
						// left item moves out
						this.$leftItm.addClass('dg-transition').css( this._getCoordinates('outleft') );
						
						this.$nextItm.addClass('dg-transition').css( this._getCoordinates('right') );
						
					}
					else {
					
						// left item moves right
						this.$leftItm.addClass('dg-transition').css( this._getCoordinates('right') );
					
					}
					break;
					
				case 'prev' :
				
					this.current	= this.$leftItm.index();
					
					// current item moves right
					this.$currentItm.addClass('dg-transition').css( this._getCoordinates('right') );
					
					// left item moves to the center
					this.$leftItm.addClass('dg-transition').css( this._getCoordinates('center') );
					
					// prev item moves to the left
					if( this.$prevItm ) {
						
						// right item moves out
						this.$rightItm.addClass('dg-transition').css( this._getCoordinates('outright') );
					
						this.$prevItm.addClass('dg-transition').css( this._getCoordinates('left') );
						
					}
					else {
					
						// right item moves left
						this.$rightItm.addClass('dg-transition').css( this._getCoordinates('left') );
					
					}
					break;	
					
			};
			
			this._setItems();
			
			if( !this.supportTrans )
				this.$currentItm.addClass('dg-center');
			
		},
		_startSlideshow		: function() {
		
			var _self	= this;
			
			this.slideshow	= setTimeout( function() {
				
				_self._navigate( 'next' );
				
				if( _self.options.autoplay ) {
				
					_self._startSlideshow();
				
				}
			
			}, this.options.interval );
		
		},
		getCurrentItem		: function() {
			return this.$currentItm;
		},
		destroy				: function() {
			
			this.$navPrev.off('.gallery');
			this.$navNext.off('.gallery');
			this.$wrapper.off('.gallery');
			
		}

	};
	
	var logError 			= function( message ) {
		if ( this.console ) {
			console.error( message );
		}
	};
	
	$.fn.gallery			= function( options ) {
	
		var result = {};
		if ( typeof options === 'string' ) {
		
			var args = Array.prototype.slice.call( arguments, 1 );
		
			this.each(function() {
		
				var instance = $(this).data('gallery');
			
				if ( !instance ) {
					logError( "cannot call methods on gallery prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
			
				instance = $.fn.gallery.lookup[$(this).data('gallery')];
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for gallery instance" );
					return;
				}
			
			
				result  = instance[ options ].apply( instance, args );
			});
	
		} else {
	
			this.each(function() {
		
				var instance = $(this).data('gallery');
				if ( !instance ) {
					instance = $.fn.gallery.lookup[$(this).data('gallery')];
					$.fn.gallery.lookup[++$.fn.gallery.lookup.i] = new $.Gallery( options, this );
			        $(this).data('gallery', $.fn.gallery.lookup.i);

				}
			});
			result = this;
		}
	
		return result ;
	
	};


	$.fn.gallery.lookup = {i:0};
})( Zepto );
