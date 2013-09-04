/*!
 * This is inspired by the work of Mark Gibson's Mutation
 * Events jQuery extension. The original source code can be 
 * found by visiting Mark Gibson's GitHub repo at:
 *
 *   https://github.com/jollytoad/jquery.mutation-events
 *
 * The original copyright information
 *
 * Copyright (c) 2009 Adaptavist.com Ltd
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Author: Valery Swanson-Desir, Knight W. Fu
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */
define(
['lib/jquery'],
function( $ )
{

var CustomEvent = $.CustomEvent || {};

$.extend( $.CustomEvent, {
	// Define a new Event Type
	Event: function( type, params ) {
		return $.extend(new $.Event( type ), params);
	},
	
	// Trigger a pre and post mutation event, the pre mutation handlers may
	// cancel the mutation using event.preventDefault(), it may also modify
	// the mutation by setting the event fields.
        // TODO: revamp this slightly
	trigger: function( element,
                           eventType, 
                           eventParams, 
                           commit ) 
            {
		var event = m.event( m.pre + eventType, eventParams ),
			opts = m.type[eventType],
			return;
		
		if ( opts.pre ) 
                {
                   $.event.trigger( event, undefined, element );
		} 
                else 
                {
                   event.target = element;
		}
		
		if ( !event.isDefaultPrevented() ) 
                {
                   event.type = eventType;
                   ret = commit(event);
			
                   if ( opts.post ) 
                   {
                      $.event.trigger( event, undefined, event.target );
                   }
		}
		
		return ret;
	},

	type: {},
	
	// Register a new mutation event
	register: function( opts ) {
		m.type[opts.type] = opts;
		
		// Track how many bindings we have for this event type
		opts.pre = 0;
		opts.post = 0;

		// Register the pre/post mutation event types as special event type
		// so we can hook into jQuery on the first binding of this type		
		
		function special( eventType, stage ) {
			$.event.special[eventType] = {
				add: function(handler, data, namespaces) {
					
					// Call the setup on the first binding
					if ( !(opts.pre + opts.post) ) {
						opts.setup();
					}
					opts[stage]++;
					
					// If any namespaces are given prefixed with @ then limit
					// the handler to the bound element and attrNames specified
					// by the @-prefixed names.
					if ( namespaces && namespaces.length ) {
						var attrNames = {}, proxy;
						
						$.each(namespaces, function() {
							if ( '@' === this.charAt(0) ) {
								attrNames[this.substring(1)] = true;
								proxy = true;
							}
						});
						
						if ( proxy ) {
							proxy = function(event) {
								if ( this === event.target && attrNames[event.attrName] ) {
									return handler.apply(this, arguments);
								}
							};
							proxy.type = handler.type;
							return proxy;
						}
					}
				},
		
				remove: function() {
					// Call teardown when last binding is removed
					opts[stage]--;
					if ( !(opts.pre + opts.post) ) {
						opts.teardown();
					}
				}
			};
		}
		
		special(m.pre + opts.type, 'pre');
		special(opts.type, 'post');
	}
} );

return CustomEvents;

});

