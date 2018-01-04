$(function () {
    console.log('ham');
    $('._hamburger').click(function () {
        $('._nav').slideToggle();
    });
});
console.log('start module 1 logic');
(function ($, window, i) {
  $.fn.responsiveSlides = function (options) {

    // Default settings
    var settings = $.extend({
      "auto": true,             // Boolean: Animate automatically, true or false
      "speed": 500,             // Integer: Speed of the transition, in milliseconds
      "timeout": 4000,          // Integer: Time between slide transitions, in milliseconds
      "pager": false,           // Boolean: Show pager, true or false
      "nav": false,             // Boolean: Show navigation, true or false
      "random": false,          // Boolean: Randomize the order of the slides, true or false
      "pause": false,           // Boolean: Pause on hover, true or false
      "pauseControls": true,    // Boolean: Pause when hovering controls, true or false
      "prevText": "Previous",   // String: Text for the "previous" button
      "nextText": "Next",       // String: Text for the "next" button
      "maxwidth": "",           // Integer: Max-width of the slideshow, in pixels
      "navContainer": "",       // Selector: Where auto generated controls should be appended to, default is after the <ul>
      "manualControls": "",     // Selector: Declare custom pager navigation
      "namespace": "rslides",   // String: change the default namespace used
      "before": $.noop,         // Function: Before callback
      "after": $.noop           // Function: After callback
    }, options);

    return this.each(function () {

      // Index for namespacing
      i++;

      var $this = $(this),

        // Local variables
        vendor,
        selectTab,
        startCycle,
        restartCycle,
        rotate,
        $tabs,

        // Helpers
        index = 0,
        $slide = $this.children(),
        length = $slide.length,
        fadeTime = parseFloat(settings.speed),
        waitTime = parseFloat(settings.timeout),
        maxw = parseFloat(settings.maxwidth),

        // Namespacing
        namespace = settings.namespace,
        namespaceIdx = namespace + i,

        // Classes
        navClass = namespace + "_nav " + namespaceIdx + "_nav",
        activeClass = namespace + "_here",
        visibleClass = namespaceIdx + "_on",
        slideClassPrefix = namespaceIdx + "_s",

        // Pager
        $pager = $("<ul class='" + namespace + "_tabs " + namespaceIdx + "_tabs' />"),

        // Styles for visible and hidden slides
        visible = {"float": "left", "position": "relative", "opacity": 1, "zIndex": 2},
        hidden = {"float": "none", "position": "absolute", "opacity": 0, "zIndex": 1},

        // Detect transition support
        supportsTransitions = (function () {
          var docBody = document.body || document.documentElement;
          var styles = docBody.style;
          var prop = "transition";
          if (typeof styles[prop] === "string") {
            return true;
          }
          // Tests for vendor specific prop
          vendor = ["Moz", "Webkit", "Khtml", "O", "ms"];
          prop = prop.charAt(0).toUpperCase() + prop.substr(1);
          var i;
          for (i = 0; i < vendor.length; i++) {
            if (typeof styles[vendor[i] + prop] === "string") {
              return true;
            }
          }
          return false;
        })(),

        // Fading animation
        slideTo = function (idx) {
          settings.before(idx);
          // If CSS3 transitions are supported
          if (supportsTransitions) {
            $slide
              .removeClass(visibleClass)
              .css(hidden)
              .eq(idx)
              .addClass(visibleClass)
              .css(visible);
            index = idx;
            setTimeout(function () {
              settings.after(idx);
            }, fadeTime);
          // If not, use jQuery fallback
          } else {
            $slide
              .stop()
              .fadeOut(fadeTime, function () {
                $(this)
                  .removeClass(visibleClass)
                  .css(hidden)
                  .css("opacity", 1);
              })
              .eq(idx)
              .fadeIn(fadeTime, function () {
                $(this)
                  .addClass(visibleClass)
                  .css(visible);
                settings.after(idx);
                index = idx;
              });
          }
        };

      // Random order
      if (settings.random) {
        $slide.sort(function () {
          return (Math.round(Math.random()) - 0.5);
        });
        $this
          .empty()
          .append($slide);
      }

      // Add ID's to each slide
      $slide.each(function (i) {
        this.id = slideClassPrefix + i;
      });

      // Add max-width and classes
      $this.addClass(namespace + " " + namespaceIdx);
      if (options && options.maxwidth) {
        $this.css("max-width", maxw);
      }

      // Hide all slides, then show first one
      $slide
        .hide()
        .css(hidden)
        .eq(0)
        .addClass(visibleClass)
        .css(visible)
        .show();

      // CSS transitions
      if (supportsTransitions) {
        $slide
          .show()
          .css({
            // -ms prefix isn't needed as IE10 uses prefix free version
            "-webkit-transition": "opacity " + fadeTime + "ms ease-in-out",
            "-moz-transition": "opacity " + fadeTime + "ms ease-in-out",
            "-o-transition": "opacity " + fadeTime + "ms ease-in-out",
            "transition": "opacity " + fadeTime + "ms ease-in-out"
          });
      }

      // Only run if there's more than one slide
      if ($slide.length > 1) {

        // Make sure the timeout is at least 100ms longer than the fade
        if (waitTime < fadeTime + 100) {
          return;
        }

        // Pager
        if (settings.pager && !settings.manualControls) {
          var tabMarkup = [];
          $slide.each(function (i) {
            var n = i + 1;
            tabMarkup +=
              "<li>" +
              "<a href='#' class='" + slideClassPrefix + n + "'>" + n + "</a>" +
              "</li>";
          });
          $pager.append(tabMarkup);

          // Inject pager
          if (options.navContainer) {
            $(settings.navContainer).append($pager);
          } else {
            $this.after($pager);
          }
        }

        // Manual pager controls
        if (settings.manualControls) {
          $pager = $(settings.manualControls);
          $pager.addClass(namespace + "_tabs " + namespaceIdx + "_tabs");
        }

        // Add pager slide class prefixes
        if (settings.pager || settings.manualControls) {
          $pager.find('li').each(function (i) {
            $(this).addClass(slideClassPrefix + (i + 1));
          });
        }

        // If we have a pager, we need to set up the selectTab function
        if (settings.pager || settings.manualControls) {
          $tabs = $pager.find('a');

          // Select pager item
          selectTab = function (idx) {
            $tabs
              .closest("li")
              .removeClass(activeClass)
              .eq(idx)
              .addClass(activeClass);
          };
        }

        // Auto cycle
        if (settings.auto) {

          startCycle = function () {
            rotate = setInterval(function () {

              // Clear the event queue
              $slide.stop(true, true);

              var idx = index + 1 < length ? index + 1 : 0;

              // Remove active state and set new if pager is set
              if (settings.pager || settings.manualControls) {
                selectTab(idx);
              }

              slideTo(idx);
            }, waitTime);
          };

          // Init cycle
          startCycle();
        }

        // Restarting cycle
        restartCycle = function () {
          if (settings.auto) {
            // Stop
            clearInterval(rotate);
            // Restart
            startCycle();
          }
        };

        // Pause on hover
        if (settings.pause) {
          $this.hover(function () {
            clearInterval(rotate);
          }, function () {
            restartCycle();
          });
        }

        // Pager click event handler
        if (settings.pager || settings.manualControls) {
          $tabs.bind("click", function (e) {
            e.preventDefault();

            if (!settings.pauseControls) {
              restartCycle();
            }

            // Get index of clicked tab
            var idx = $tabs.index(this);

            // Break if element is already active or currently animated
            if (index === idx || $("." + visibleClass).queue('fx').length) {
              return;
            }

            // Remove active state from old tab and set new one
            selectTab(idx);

            // Do the animation
            slideTo(idx);
          })
            .eq(0)
            .closest("li")
            .addClass(activeClass);

          // Pause when hovering pager
          if (settings.pauseControls) {
            $tabs.hover(function () {
              clearInterval(rotate);
            }, function () {
              restartCycle();
            });
          }
        }

        // Navigation
        if (settings.nav) {
          var navMarkup =
            "<a href='#' class='" + navClass + " prev'>" + settings.prevText + "</a>" +
            "<a href='#' class='" + navClass + " next'>" + settings.nextText + "</a>";

          // Inject navigation
          if (options.navContainer) {
            $(settings.navContainer).append(navMarkup);
          } else {
            $this.after(navMarkup);
          }

          var $trigger = $("." + namespaceIdx + "_nav"),
            $prev = $trigger.filter(".prev");

          // Click event handler
          $trigger.bind("click", function (e) {
            e.preventDefault();

            var $visibleClass = $("." + visibleClass);

            // Prevent clicking if currently animated
            if ($visibleClass.queue('fx').length) {
              return;
            }

            //  Adds active class during slide animation
            //  $(this)
            //    .addClass(namespace + "_active")
            //    .delay(fadeTime)
            //    .queue(function (next) {
            //      $(this).removeClass(namespace + "_active");
            //      next();
            //  });

            // Determine where to slide
            var idx = $slide.index($visibleClass),
              prevIdx = idx - 1,
              nextIdx = idx + 1 < length ? index + 1 : 0;

            // Go to slide
            slideTo($(this)[0] === $prev[0] ? prevIdx : nextIdx);
            if (settings.pager || settings.manualControls) {
              selectTab($(this)[0] === $prev[0] ? prevIdx : nextIdx);
            }

            if (!settings.pauseControls) {
              restartCycle();
            }
          });

          // Pause when hovering navigation
          if (settings.pauseControls) {
            $trigger.hover(function () {
              clearInterval(rotate);
            }, function () {
              restartCycle();
            });
          }
        }

      }

      // Max-width fallback
      if (typeof document.body.style.maxWidth === "undefined" && options.maxwidth) {
        var widthSupport = function () {
          $this.css("width", "100%");
          if ($this.width() > maxw) {
            $this.css("width", maxw);
          }
        };

        // Init fallback
        widthSupport();
        $(window).bind("resize", function () {
          widthSupport();
        });
      }

    });

  };
})(jQuery, this, 0);
console.log('start module 2 logic');

console.log('start module 3 logic');

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhbWJ1cmdlci5qcyIsIm1vZHVsZTEuanMiLCJtb2R1bGUyLmpzIiwibW9kdWxlMy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdYQTtBQUNBO0FDREE7QUFDQSIsImZpbGUiOiJidWlsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiQoZnVuY3Rpb24gKCkge1xyXG4gICAgY29uc29sZS5sb2coJ2hhbScpO1xyXG4gICAgJCgnLl9oYW1idXJnZXInKS5jbGljayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLl9uYXYnKS5zbGlkZVRvZ2dsZSgpO1xyXG4gICAgfSk7XHJcbn0pOyIsImNvbnNvbGUubG9nKCdzdGFydCBtb2R1bGUgMSBsb2dpYycpO1xyXG4oZnVuY3Rpb24gKCQsIHdpbmRvdywgaSkge1xyXG4gICQuZm4ucmVzcG9uc2l2ZVNsaWRlcyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblxyXG4gICAgLy8gRGVmYXVsdCBzZXR0aW5nc1xyXG4gICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe1xyXG4gICAgICBcImF1dG9cIjogdHJ1ZSwgICAgICAgICAgICAgLy8gQm9vbGVhbjogQW5pbWF0ZSBhdXRvbWF0aWNhbGx5LCB0cnVlIG9yIGZhbHNlXHJcbiAgICAgIFwic3BlZWRcIjogNTAwLCAgICAgICAgICAgICAvLyBJbnRlZ2VyOiBTcGVlZCBvZiB0aGUgdHJhbnNpdGlvbiwgaW4gbWlsbGlzZWNvbmRzXHJcbiAgICAgIFwidGltZW91dFwiOiA0MDAwLCAgICAgICAgICAvLyBJbnRlZ2VyOiBUaW1lIGJldHdlZW4gc2xpZGUgdHJhbnNpdGlvbnMsIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICBcInBhZ2VyXCI6IGZhbHNlLCAgICAgICAgICAgLy8gQm9vbGVhbjogU2hvdyBwYWdlciwgdHJ1ZSBvciBmYWxzZVxyXG4gICAgICBcIm5hdlwiOiBmYWxzZSwgICAgICAgICAgICAgLy8gQm9vbGVhbjogU2hvdyBuYXZpZ2F0aW9uLCB0cnVlIG9yIGZhbHNlXHJcbiAgICAgIFwicmFuZG9tXCI6IGZhbHNlLCAgICAgICAgICAvLyBCb29sZWFuOiBSYW5kb21pemUgdGhlIG9yZGVyIG9mIHRoZSBzbGlkZXMsIHRydWUgb3IgZmFsc2VcclxuICAgICAgXCJwYXVzZVwiOiBmYWxzZSwgICAgICAgICAgIC8vIEJvb2xlYW46IFBhdXNlIG9uIGhvdmVyLCB0cnVlIG9yIGZhbHNlXHJcbiAgICAgIFwicGF1c2VDb250cm9sc1wiOiB0cnVlLCAgICAvLyBCb29sZWFuOiBQYXVzZSB3aGVuIGhvdmVyaW5nIGNvbnRyb2xzLCB0cnVlIG9yIGZhbHNlXHJcbiAgICAgIFwicHJldlRleHRcIjogXCJQcmV2aW91c1wiLCAgIC8vIFN0cmluZzogVGV4dCBmb3IgdGhlIFwicHJldmlvdXNcIiBidXR0b25cclxuICAgICAgXCJuZXh0VGV4dFwiOiBcIk5leHRcIiwgICAgICAgLy8gU3RyaW5nOiBUZXh0IGZvciB0aGUgXCJuZXh0XCIgYnV0dG9uXHJcbiAgICAgIFwibWF4d2lkdGhcIjogXCJcIiwgICAgICAgICAgIC8vIEludGVnZXI6IE1heC13aWR0aCBvZiB0aGUgc2xpZGVzaG93LCBpbiBwaXhlbHNcclxuICAgICAgXCJuYXZDb250YWluZXJcIjogXCJcIiwgICAgICAgLy8gU2VsZWN0b3I6IFdoZXJlIGF1dG8gZ2VuZXJhdGVkIGNvbnRyb2xzIHNob3VsZCBiZSBhcHBlbmRlZCB0bywgZGVmYXVsdCBpcyBhZnRlciB0aGUgPHVsPlxyXG4gICAgICBcIm1hbnVhbENvbnRyb2xzXCI6IFwiXCIsICAgICAvLyBTZWxlY3RvcjogRGVjbGFyZSBjdXN0b20gcGFnZXIgbmF2aWdhdGlvblxyXG4gICAgICBcIm5hbWVzcGFjZVwiOiBcInJzbGlkZXNcIiwgICAvLyBTdHJpbmc6IGNoYW5nZSB0aGUgZGVmYXVsdCBuYW1lc3BhY2UgdXNlZFxyXG4gICAgICBcImJlZm9yZVwiOiAkLm5vb3AsICAgICAgICAgLy8gRnVuY3Rpb246IEJlZm9yZSBjYWxsYmFja1xyXG4gICAgICBcImFmdGVyXCI6ICQubm9vcCAgICAgICAgICAgLy8gRnVuY3Rpb246IEFmdGVyIGNhbGxiYWNrXHJcbiAgICB9LCBvcHRpb25zKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIC8vIEluZGV4IGZvciBuYW1lc3BhY2luZ1xyXG4gICAgICBpKys7XHJcblxyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG5cclxuICAgICAgICAvLyBMb2NhbCB2YXJpYWJsZXNcclxuICAgICAgICB2ZW5kb3IsXHJcbiAgICAgICAgc2VsZWN0VGFiLFxyXG4gICAgICAgIHN0YXJ0Q3ljbGUsXHJcbiAgICAgICAgcmVzdGFydEN5Y2xlLFxyXG4gICAgICAgIHJvdGF0ZSxcclxuICAgICAgICAkdGFicyxcclxuXHJcbiAgICAgICAgLy8gSGVscGVyc1xyXG4gICAgICAgIGluZGV4ID0gMCxcclxuICAgICAgICAkc2xpZGUgPSAkdGhpcy5jaGlsZHJlbigpLFxyXG4gICAgICAgIGxlbmd0aCA9ICRzbGlkZS5sZW5ndGgsXHJcbiAgICAgICAgZmFkZVRpbWUgPSBwYXJzZUZsb2F0KHNldHRpbmdzLnNwZWVkKSxcclxuICAgICAgICB3YWl0VGltZSA9IHBhcnNlRmxvYXQoc2V0dGluZ3MudGltZW91dCksXHJcbiAgICAgICAgbWF4dyA9IHBhcnNlRmxvYXQoc2V0dGluZ3MubWF4d2lkdGgpLFxyXG5cclxuICAgICAgICAvLyBOYW1lc3BhY2luZ1xyXG4gICAgICAgIG5hbWVzcGFjZSA9IHNldHRpbmdzLm5hbWVzcGFjZSxcclxuICAgICAgICBuYW1lc3BhY2VJZHggPSBuYW1lc3BhY2UgKyBpLFxyXG5cclxuICAgICAgICAvLyBDbGFzc2VzXHJcbiAgICAgICAgbmF2Q2xhc3MgPSBuYW1lc3BhY2UgKyBcIl9uYXYgXCIgKyBuYW1lc3BhY2VJZHggKyBcIl9uYXZcIixcclxuICAgICAgICBhY3RpdmVDbGFzcyA9IG5hbWVzcGFjZSArIFwiX2hlcmVcIixcclxuICAgICAgICB2aXNpYmxlQ2xhc3MgPSBuYW1lc3BhY2VJZHggKyBcIl9vblwiLFxyXG4gICAgICAgIHNsaWRlQ2xhc3NQcmVmaXggPSBuYW1lc3BhY2VJZHggKyBcIl9zXCIsXHJcblxyXG4gICAgICAgIC8vIFBhZ2VyXHJcbiAgICAgICAgJHBhZ2VyID0gJChcIjx1bCBjbGFzcz0nXCIgKyBuYW1lc3BhY2UgKyBcIl90YWJzIFwiICsgbmFtZXNwYWNlSWR4ICsgXCJfdGFicycgLz5cIiksXHJcblxyXG4gICAgICAgIC8vIFN0eWxlcyBmb3IgdmlzaWJsZSBhbmQgaGlkZGVuIHNsaWRlc1xyXG4gICAgICAgIHZpc2libGUgPSB7XCJmbG9hdFwiOiBcImxlZnRcIiwgXCJwb3NpdGlvblwiOiBcInJlbGF0aXZlXCIsIFwib3BhY2l0eVwiOiAxLCBcInpJbmRleFwiOiAyfSxcclxuICAgICAgICBoaWRkZW4gPSB7XCJmbG9hdFwiOiBcIm5vbmVcIiwgXCJwb3NpdGlvblwiOiBcImFic29sdXRlXCIsIFwib3BhY2l0eVwiOiAwLCBcInpJbmRleFwiOiAxfSxcclxuXHJcbiAgICAgICAgLy8gRGV0ZWN0IHRyYW5zaXRpb24gc3VwcG9ydFxyXG4gICAgICAgIHN1cHBvcnRzVHJhbnNpdGlvbnMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdmFyIGRvY0JvZHkgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICAgIHZhciBzdHlsZXMgPSBkb2NCb2R5LnN0eWxlO1xyXG4gICAgICAgICAgdmFyIHByb3AgPSBcInRyYW5zaXRpb25cIjtcclxuICAgICAgICAgIGlmICh0eXBlb2Ygc3R5bGVzW3Byb3BdID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gVGVzdHMgZm9yIHZlbmRvciBzcGVjaWZpYyBwcm9wXHJcbiAgICAgICAgICB2ZW5kb3IgPSBbXCJNb3pcIiwgXCJXZWJraXRcIiwgXCJLaHRtbFwiLCBcIk9cIiwgXCJtc1wiXTtcclxuICAgICAgICAgIHByb3AgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHIoMSk7XHJcbiAgICAgICAgICB2YXIgaTtcclxuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB2ZW5kb3IubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdHlsZXNbdmVuZG9yW2ldICsgcHJvcF0gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pKCksXHJcblxyXG4gICAgICAgIC8vIEZhZGluZyBhbmltYXRpb25cclxuICAgICAgICBzbGlkZVRvID0gZnVuY3Rpb24gKGlkeCkge1xyXG4gICAgICAgICAgc2V0dGluZ3MuYmVmb3JlKGlkeCk7XHJcbiAgICAgICAgICAvLyBJZiBDU1MzIHRyYW5zaXRpb25zIGFyZSBzdXBwb3J0ZWRcclxuICAgICAgICAgIGlmIChzdXBwb3J0c1RyYW5zaXRpb25zKSB7XHJcbiAgICAgICAgICAgICRzbGlkZVxyXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh2aXNpYmxlQ2xhc3MpXHJcbiAgICAgICAgICAgICAgLmNzcyhoaWRkZW4pXHJcbiAgICAgICAgICAgICAgLmVxKGlkeClcclxuICAgICAgICAgICAgICAuYWRkQ2xhc3ModmlzaWJsZUNsYXNzKVxyXG4gICAgICAgICAgICAgIC5jc3ModmlzaWJsZSk7XHJcbiAgICAgICAgICAgIGluZGV4ID0gaWR4O1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBzZXR0aW5ncy5hZnRlcihpZHgpO1xyXG4gICAgICAgICAgICB9LCBmYWRlVGltZSk7XHJcbiAgICAgICAgICAvLyBJZiBub3QsIHVzZSBqUXVlcnkgZmFsbGJhY2tcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzbGlkZVxyXG4gICAgICAgICAgICAgIC5zdG9wKClcclxuICAgICAgICAgICAgICAuZmFkZU91dChmYWRlVGltZSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModmlzaWJsZUNsYXNzKVxyXG4gICAgICAgICAgICAgICAgICAuY3NzKGhpZGRlbilcclxuICAgICAgICAgICAgICAgICAgLmNzcyhcIm9wYWNpdHlcIiwgMSk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuZXEoaWR4KVxyXG4gICAgICAgICAgICAgIC5mYWRlSW4oZmFkZVRpbWUsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcylcclxuICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKHZpc2libGVDbGFzcylcclxuICAgICAgICAgICAgICAgICAgLmNzcyh2aXNpYmxlKTtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLmFmdGVyKGlkeCk7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IGlkeDtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgLy8gUmFuZG9tIG9yZGVyXHJcbiAgICAgIGlmIChzZXR0aW5ncy5yYW5kb20pIHtcclxuICAgICAgICAkc2xpZGUuc29ydChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICByZXR1cm4gKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSkgLSAwLjUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICR0aGlzXHJcbiAgICAgICAgICAuZW1wdHkoKVxyXG4gICAgICAgICAgLmFwcGVuZCgkc2xpZGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgSUQncyB0byBlYWNoIHNsaWRlXHJcbiAgICAgICRzbGlkZS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IHNsaWRlQ2xhc3NQcmVmaXggKyBpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEFkZCBtYXgtd2lkdGggYW5kIGNsYXNzZXNcclxuICAgICAgJHRoaXMuYWRkQ2xhc3MobmFtZXNwYWNlICsgXCIgXCIgKyBuYW1lc3BhY2VJZHgpO1xyXG4gICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm1heHdpZHRoKSB7XHJcbiAgICAgICAgJHRoaXMuY3NzKFwibWF4LXdpZHRoXCIsIG1heHcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBIaWRlIGFsbCBzbGlkZXMsIHRoZW4gc2hvdyBmaXJzdCBvbmVcclxuICAgICAgJHNsaWRlXHJcbiAgICAgICAgLmhpZGUoKVxyXG4gICAgICAgIC5jc3MoaGlkZGVuKVxyXG4gICAgICAgIC5lcSgwKVxyXG4gICAgICAgIC5hZGRDbGFzcyh2aXNpYmxlQ2xhc3MpXHJcbiAgICAgICAgLmNzcyh2aXNpYmxlKVxyXG4gICAgICAgIC5zaG93KCk7XHJcblxyXG4gICAgICAvLyBDU1MgdHJhbnNpdGlvbnNcclxuICAgICAgaWYgKHN1cHBvcnRzVHJhbnNpdGlvbnMpIHtcclxuICAgICAgICAkc2xpZGVcclxuICAgICAgICAgIC5zaG93KClcclxuICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAvLyAtbXMgcHJlZml4IGlzbid0IG5lZWRlZCBhcyBJRTEwIHVzZXMgcHJlZml4IGZyZWUgdmVyc2lvblxyXG4gICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNpdGlvblwiOiBcIm9wYWNpdHkgXCIgKyBmYWRlVGltZSArIFwibXMgZWFzZS1pbi1vdXRcIixcclxuICAgICAgICAgICAgXCItbW96LXRyYW5zaXRpb25cIjogXCJvcGFjaXR5IFwiICsgZmFkZVRpbWUgKyBcIm1zIGVhc2UtaW4tb3V0XCIsXHJcbiAgICAgICAgICAgIFwiLW8tdHJhbnNpdGlvblwiOiBcIm9wYWNpdHkgXCIgKyBmYWRlVGltZSArIFwibXMgZWFzZS1pbi1vdXRcIixcclxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uXCI6IFwib3BhY2l0eSBcIiArIGZhZGVUaW1lICsgXCJtcyBlYXNlLWluLW91dFwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gT25seSBydW4gaWYgdGhlcmUncyBtb3JlIHRoYW4gb25lIHNsaWRlXHJcbiAgICAgIGlmICgkc2xpZGUubGVuZ3RoID4gMSkge1xyXG5cclxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHRpbWVvdXQgaXMgYXQgbGVhc3QgMTAwbXMgbG9uZ2VyIHRoYW4gdGhlIGZhZGVcclxuICAgICAgICBpZiAod2FpdFRpbWUgPCBmYWRlVGltZSArIDEwMCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUGFnZXJcclxuICAgICAgICBpZiAoc2V0dGluZ3MucGFnZXIgJiYgIXNldHRpbmdzLm1hbnVhbENvbnRyb2xzKSB7XHJcbiAgICAgICAgICB2YXIgdGFiTWFya3VwID0gW107XHJcbiAgICAgICAgICAkc2xpZGUuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICB2YXIgbiA9IGkgKyAxO1xyXG4gICAgICAgICAgICB0YWJNYXJrdXAgKz1cclxuICAgICAgICAgICAgICBcIjxsaT5cIiArXHJcbiAgICAgICAgICAgICAgXCI8YSBocmVmPScjJyBjbGFzcz0nXCIgKyBzbGlkZUNsYXNzUHJlZml4ICsgbiArIFwiJz5cIiArIG4gKyBcIjwvYT5cIiArXHJcbiAgICAgICAgICAgICAgXCI8L2xpPlwiO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICAkcGFnZXIuYXBwZW5kKHRhYk1hcmt1cCk7XHJcblxyXG4gICAgICAgICAgLy8gSW5qZWN0IHBhZ2VyXHJcbiAgICAgICAgICBpZiAob3B0aW9ucy5uYXZDb250YWluZXIpIHtcclxuICAgICAgICAgICAgJChzZXR0aW5ncy5uYXZDb250YWluZXIpLmFwcGVuZCgkcGFnZXIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHRoaXMuYWZ0ZXIoJHBhZ2VyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE1hbnVhbCBwYWdlciBjb250cm9sc1xyXG4gICAgICAgIGlmIChzZXR0aW5ncy5tYW51YWxDb250cm9scykge1xyXG4gICAgICAgICAgJHBhZ2VyID0gJChzZXR0aW5ncy5tYW51YWxDb250cm9scyk7XHJcbiAgICAgICAgICAkcGFnZXIuYWRkQ2xhc3MobmFtZXNwYWNlICsgXCJfdGFicyBcIiArIG5hbWVzcGFjZUlkeCArIFwiX3RhYnNcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgcGFnZXIgc2xpZGUgY2xhc3MgcHJlZml4ZXNcclxuICAgICAgICBpZiAoc2V0dGluZ3MucGFnZXIgfHwgc2V0dGluZ3MubWFudWFsQ29udHJvbHMpIHtcclxuICAgICAgICAgICRwYWdlci5maW5kKCdsaScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhzbGlkZUNsYXNzUHJlZml4ICsgKGkgKyAxKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHdlIGhhdmUgYSBwYWdlciwgd2UgbmVlZCB0byBzZXQgdXAgdGhlIHNlbGVjdFRhYiBmdW5jdGlvblxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5wYWdlciB8fCBzZXR0aW5ncy5tYW51YWxDb250cm9scykge1xyXG4gICAgICAgICAgJHRhYnMgPSAkcGFnZXIuZmluZCgnYScpO1xyXG5cclxuICAgICAgICAgIC8vIFNlbGVjdCBwYWdlciBpdGVtXHJcbiAgICAgICAgICBzZWxlY3RUYWIgPSBmdW5jdGlvbiAoaWR4KSB7XHJcbiAgICAgICAgICAgICR0YWJzXHJcbiAgICAgICAgICAgICAgLmNsb3Nlc3QoXCJsaVwiKVxyXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhhY3RpdmVDbGFzcylcclxuICAgICAgICAgICAgICAuZXEoaWR4KVxyXG4gICAgICAgICAgICAgIC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXV0byBjeWNsZVxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5hdXRvKSB7XHJcblxyXG4gICAgICAgICAgc3RhcnRDeWNsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcm90YXRlID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBDbGVhciB0aGUgZXZlbnQgcXVldWVcclxuICAgICAgICAgICAgICAkc2xpZGUuc3RvcCh0cnVlLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgdmFyIGlkeCA9IGluZGV4ICsgMSA8IGxlbmd0aCA/IGluZGV4ICsgMSA6IDA7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFJlbW92ZSBhY3RpdmUgc3RhdGUgYW5kIHNldCBuZXcgaWYgcGFnZXIgaXMgc2V0XHJcbiAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnBhZ2VyIHx8IHNldHRpbmdzLm1hbnVhbENvbnRyb2xzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RUYWIoaWR4KTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHNsaWRlVG8oaWR4KTtcclxuICAgICAgICAgICAgfSwgd2FpdFRpbWUpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvLyBJbml0IGN5Y2xlXHJcbiAgICAgICAgICBzdGFydEN5Y2xlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0aW5nIGN5Y2xlXHJcbiAgICAgICAgcmVzdGFydEN5Y2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgaWYgKHNldHRpbmdzLmF1dG8pIHtcclxuICAgICAgICAgICAgLy8gU3RvcFxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHJvdGF0ZSk7XHJcbiAgICAgICAgICAgIC8vIFJlc3RhcnRcclxuICAgICAgICAgICAgc3RhcnRDeWNsZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIFBhdXNlIG9uIGhvdmVyXHJcbiAgICAgICAgaWYgKHNldHRpbmdzLnBhdXNlKSB7XHJcbiAgICAgICAgICAkdGhpcy5ob3ZlcihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocm90YXRlKTtcclxuICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmVzdGFydEN5Y2xlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBhZ2VyIGNsaWNrIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICBpZiAoc2V0dGluZ3MucGFnZXIgfHwgc2V0dGluZ3MubWFudWFsQ29udHJvbHMpIHtcclxuICAgICAgICAgICR0YWJzLmJpbmQoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNldHRpbmdzLnBhdXNlQ29udHJvbHMpIHtcclxuICAgICAgICAgICAgICByZXN0YXJ0Q3ljbGUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gR2V0IGluZGV4IG9mIGNsaWNrZWQgdGFiXHJcbiAgICAgICAgICAgIHZhciBpZHggPSAkdGFicy5pbmRleCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEJyZWFrIGlmIGVsZW1lbnQgaXMgYWxyZWFkeSBhY3RpdmUgb3IgY3VycmVudGx5IGFuaW1hdGVkXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gaWR4IHx8ICQoXCIuXCIgKyB2aXNpYmxlQ2xhc3MpLnF1ZXVlKCdmeCcpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFjdGl2ZSBzdGF0ZSBmcm9tIG9sZCB0YWIgYW5kIHNldCBuZXcgb25lXHJcbiAgICAgICAgICAgIHNlbGVjdFRhYihpZHgpO1xyXG5cclxuICAgICAgICAgICAgLy8gRG8gdGhlIGFuaW1hdGlvblxyXG4gICAgICAgICAgICBzbGlkZVRvKGlkeCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZXEoMClcclxuICAgICAgICAgICAgLmNsb3Nlc3QoXCJsaVwiKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xyXG5cclxuICAgICAgICAgIC8vIFBhdXNlIHdoZW4gaG92ZXJpbmcgcGFnZXJcclxuICAgICAgICAgIGlmIChzZXR0aW5ncy5wYXVzZUNvbnRyb2xzKSB7XHJcbiAgICAgICAgICAgICR0YWJzLmhvdmVyKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBjbGVhckludGVydmFsKHJvdGF0ZSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICByZXN0YXJ0Q3ljbGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOYXZpZ2F0aW9uXHJcbiAgICAgICAgaWYgKHNldHRpbmdzLm5hdikge1xyXG4gICAgICAgICAgdmFyIG5hdk1hcmt1cCA9XHJcbiAgICAgICAgICAgIFwiPGEgaHJlZj0nIycgY2xhc3M9J1wiICsgbmF2Q2xhc3MgKyBcIiBwcmV2Jz5cIiArIHNldHRpbmdzLnByZXZUZXh0ICsgXCI8L2E+XCIgK1xyXG4gICAgICAgICAgICBcIjxhIGhyZWY9JyMnIGNsYXNzPSdcIiArIG5hdkNsYXNzICsgXCIgbmV4dCc+XCIgKyBzZXR0aW5ncy5uZXh0VGV4dCArIFwiPC9hPlwiO1xyXG5cclxuICAgICAgICAgIC8vIEluamVjdCBuYXZpZ2F0aW9uXHJcbiAgICAgICAgICBpZiAob3B0aW9ucy5uYXZDb250YWluZXIpIHtcclxuICAgICAgICAgICAgJChzZXR0aW5ncy5uYXZDb250YWluZXIpLmFwcGVuZChuYXZNYXJrdXApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHRoaXMuYWZ0ZXIobmF2TWFya3VwKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB2YXIgJHRyaWdnZXIgPSAkKFwiLlwiICsgbmFtZXNwYWNlSWR4ICsgXCJfbmF2XCIpLFxyXG4gICAgICAgICAgICAkcHJldiA9ICR0cmlnZ2VyLmZpbHRlcihcIi5wcmV2XCIpO1xyXG5cclxuICAgICAgICAgIC8vIENsaWNrIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgICR0cmlnZ2VyLmJpbmQoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgJHZpc2libGVDbGFzcyA9ICQoXCIuXCIgKyB2aXNpYmxlQ2xhc3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gUHJldmVudCBjbGlja2luZyBpZiBjdXJyZW50bHkgYW5pbWF0ZWRcclxuICAgICAgICAgICAgaWYgKCR2aXNpYmxlQ2xhc3MucXVldWUoJ2Z4JykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAgQWRkcyBhY3RpdmUgY2xhc3MgZHVyaW5nIHNsaWRlIGFuaW1hdGlvblxyXG4gICAgICAgICAgICAvLyAgJCh0aGlzKVxyXG4gICAgICAgICAgICAvLyAgICAuYWRkQ2xhc3MobmFtZXNwYWNlICsgXCJfYWN0aXZlXCIpXHJcbiAgICAgICAgICAgIC8vICAgIC5kZWxheShmYWRlVGltZSlcclxuICAgICAgICAgICAgLy8gICAgLnF1ZXVlKGZ1bmN0aW9uIChuZXh0KSB7XHJcbiAgICAgICAgICAgIC8vICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhuYW1lc3BhY2UgKyBcIl9hY3RpdmVcIik7XHJcbiAgICAgICAgICAgIC8vICAgICAgbmV4dCgpO1xyXG4gICAgICAgICAgICAvLyAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hlcmUgdG8gc2xpZGVcclxuICAgICAgICAgICAgdmFyIGlkeCA9ICRzbGlkZS5pbmRleCgkdmlzaWJsZUNsYXNzKSxcclxuICAgICAgICAgICAgICBwcmV2SWR4ID0gaWR4IC0gMSxcclxuICAgICAgICAgICAgICBuZXh0SWR4ID0gaWR4ICsgMSA8IGxlbmd0aCA/IGluZGV4ICsgMSA6IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBHbyB0byBzbGlkZVxyXG4gICAgICAgICAgICBzbGlkZVRvKCQodGhpcylbMF0gPT09ICRwcmV2WzBdID8gcHJldklkeCA6IG5leHRJZHgpO1xyXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucGFnZXIgfHwgc2V0dGluZ3MubWFudWFsQ29udHJvbHMpIHtcclxuICAgICAgICAgICAgICBzZWxlY3RUYWIoJCh0aGlzKVswXSA9PT0gJHByZXZbMF0gPyBwcmV2SWR4IDogbmV4dElkeCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghc2V0dGluZ3MucGF1c2VDb250cm9scykge1xyXG4gICAgICAgICAgICAgIHJlc3RhcnRDeWNsZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyBQYXVzZSB3aGVuIGhvdmVyaW5nIG5hdmlnYXRpb25cclxuICAgICAgICAgIGlmIChzZXR0aW5ncy5wYXVzZUNvbnRyb2xzKSB7XHJcbiAgICAgICAgICAgICR0cmlnZ2VyLmhvdmVyKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBjbGVhckludGVydmFsKHJvdGF0ZSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICByZXN0YXJ0Q3ljbGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTWF4LXdpZHRoIGZhbGxiYWNrXHJcbiAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQuYm9keS5zdHlsZS5tYXhXaWR0aCA9PT0gXCJ1bmRlZmluZWRcIiAmJiBvcHRpb25zLm1heHdpZHRoKSB7XHJcbiAgICAgICAgdmFyIHdpZHRoU3VwcG9ydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICR0aGlzLmNzcyhcIndpZHRoXCIsIFwiMTAwJVwiKTtcclxuICAgICAgICAgIGlmICgkdGhpcy53aWR0aCgpID4gbWF4dykge1xyXG4gICAgICAgICAgICAkdGhpcy5jc3MoXCJ3aWR0aFwiLCBtYXh3KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBJbml0IGZhbGxiYWNrXHJcbiAgICAgICAgd2lkdGhTdXBwb3J0KCk7XHJcbiAgICAgICAgJCh3aW5kb3cpLmJpbmQoXCJyZXNpemVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgd2lkdGhTdXBwb3J0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcbiAgfTtcclxufSkoalF1ZXJ5LCB0aGlzLCAwKTsiLCJjb25zb2xlLmxvZygnc3RhcnQgbW9kdWxlIDIgbG9naWMnKTtcclxuIiwiY29uc29sZS5sb2coJ3N0YXJ0IG1vZHVsZSAzIGxvZ2ljJyk7XHJcbiJdfQ==
