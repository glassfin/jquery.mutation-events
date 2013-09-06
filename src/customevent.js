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
 *
 * Minimum Browser Version when used with jQuery 1.x
 * FF 1
 * Chrome 1
 * Safari 1
 * Opera 1
 * IE 6
 *
 * Minimum Browser Version when used with jQuery 2.x
 * FF 1
 * Chrome 1
 * Safari 1
 * Opera 1
 * IE 9
 *
 */
( function( $ )
{

var CustomEvent = $.CustomEvent = $.CustomEvent || {}; 

$.extend( CustomEvent, {
   // Define a new Event Type
   Event: function( type, params ) {
          return $.extend(new $.Event( type ), params);
   },

   pre : 'pre',

   /**
    * Class CustomEvent.EventType
    *
    * Extend
    *    * setup ( void ) 
    *      to be called when the event type is first added
    *
    *    * teardown ( void )
    *      to be called when the event type is removed
    */
   EventType : function( type, config )
   {
      return {
         // the type of the event
         'type' : type,

         setup : function()
         {
            // add event sugar '$.{type}( eventData = null, handler )' 
            // for ...
            function _addJQEventSugar( eventName )
            {
               $.fn[ eventName ] = function( data, handler )
               {
                  if( handler === undefined )
                  {
                     return $.fn.on.call( this, eventName, data );
                  }

                  return $.fn.on.call( this, eventName, data, handler );
               }
            }

            // ... the pre-event ...
            _addJQEventSugar( CustomEvent.pre + type );

            // ... and the actual event
            _addJQEventSugar( type );

            // call setup if it is defined
            if( config.setup )
               config.setup.call( this );
         },

         teardown : function()
         {
            // remove the event sugars
            delete $.fn[ type ];
            delete $.fn[ CustomEvent.pre + type ];

            // call teardown if it is defined
            if( config.teardown )
               config.teardown.call( this );
         }
      };
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
      var event = CustomEvent.Event( CustomEvent.pre + eventType, eventParams ),

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

   // Register a new custom event
   register: function( eventTypeObj 
                       // the event type object to register
                     ) 
   {
      CustomEvent.type[ eventTypeObj.type ] = eventTypeObj;

      // initialize the number of pre/post events to 0
      eventTypeObj.pre = 0;
      eventTypeObj.post = 0;

      // Register the pre/post custom events type as special event type
      // so we can hook into jQuery 
      function addNewEvent( eventType, stage ) 
      {
         $.event.special[eventType] = 
         {
            // this method is invoked when user calls 'on'
            add: function( handler, data, namespaces ) 
            {
               // Call the event type's setup function on the first time
               // the user binds to the event
               if ( !( eventTypeObj.pre + eventTypeObj.post ) ) 
                  eventTypeObj.setup();

               eventTypeObj[ stage ]++;

               // if an event handler is added with namespaces
               if ( namespaces && namespaces.length ) 
               {
                  var attrNames = {}, 
                  // list of attributes names associated
                  // with the handler
                  
                  proxy = false;
                  // keeps track of whether proxy is used, and
                  // if used, saves the object

                  // for each namespace ...
                  $.each(namespaces, function() 
                  {
                     // If any namespaces are given prefixed with @ then limit
                     // the handler to the bound element and attrNames specified
                     // by the @-prefixed names.
                     if ( '@' === this.charAt(0) ) 
                     {
                        attrNames[ this.substring(1) ] = true;
                        proxy = true;
                     }
                  } );
                  
                  // if we use proxy ...
                  if ( proxy ) 
                  {
                     // ... reset the proxy to this event
                     proxy = function( event ) 
                     {
                        if ( this === event.target && 
                             attrNames[ event.attrName ] ) 
                        {
                           return handler.apply( this, arguments );
                        }
                     };

                     // ... set the proxy type
                     proxy.type = handler.type;

                     return proxy;
                  }
               }
            },

            // this method is invoked when user calls 'off'
            remove: function() 
            {
               opts[ stage ]--;
               // Call teardown when last binding is removed
               if ( !( eventTypeObj.pre + eventTypeObj.post) ) 
               {
                  eventTypeObj.teardown();
               }
            }
         };
      }
      
      // add the pre event associated with this event type
      addNewEvent( CustomEvent.pre + eventTypeObj.type, 'pre');

      // add a post event associated with this event type
      addNewEvent( eventTypeObj.type, 'post');
   }
} );

} )( $ );

