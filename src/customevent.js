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
   trigger: function( element,
                      // the element on which the event is triggered
                      
                     eventType, 
                     // the type of event

                     eventParams, 
                     // the parameters to pass to the event
                     // handlers

                     defaultAction 
                     // the event's default action
                    ) 
   {
      var event = CustomEvent.Event( "pre-" + eventType, eventParams ),

      // get the registered event object
      eventTypeObj = CustomEvent.type[eventType];

      // if there is no such object, then don't do
      // anything
      if( !eventTypeObj ) return;
      
      event.target = element;
      // if pre-event has more than one registered
      // handler
      if ( eventTypeObj.pre ) 
         $.event.trigger( event, undefined, event.target );
      
      // if the default action is not cancelled
      var returnVal;
      if ( !event.isDefaultPrevented() ) 
      {
         event.type = eventType;
         returnVal = action(event);

         // if there are any post handlers registered
         if ( eventTypeObj.post ) 
         {
            // trigger the post handlers event
            $.event.trigger( event, undefined, 
               event.target );
         }
      }

      // return any value returned by the action
      return returnVal;
   },

   // an associative array that keeps track of
   // the types
   type: {},

   // Register a new mutation event
   register: function( opts ) {
          m.type[opts.type] = opts;
          
          // Track how many bindings we have for this event type
          opts.pre = 0;
          opts.post = 0;

          // Register the pre/post mutation event types as special event type
          // so we can hook into jQuery on the first binding of this type		
          
          function createNewEventType( eventType, stage ) {
                  $.event.special[eventType] = {
                          add: function( handler, data, namespaces) {
                                  
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
