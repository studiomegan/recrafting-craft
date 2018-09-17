// EASYZOOM BY I LIKE ROBOTS
/*!
 * @name        easyzoom
 * @author      Matt Hinchliffe <>
 * @modified    Tuesday, February 14th, 2017
 * @version     2.5.0
 */
 // Edited by studio MEGAN (www.studiomegan.nl)

(function (root, factory) {
    'use strict';
    if(typeof define === 'function' && define.amd) {
        define(['jquery'], function($){
            factory($);
        });
    } else if(typeof module === 'object' && module.exports) {
        module.exports = (root.EasyZoom = factory(require('jquery')));
    } else {
        root.EasyZoom = factory(root.jQuery);
    }
}(this, function ($) {

    'use strict';

    var dw, dh, rw, rh, lx, ly;

    var defaults = {

        // The text to display within the notice box while loading the zoom image.
        loadingNotice: 'Loading image',

        // The text to display within the notice box if an error occurs when loading the zoom image.
        errorNotice: 'The image could not be loaded',

        // The time (in milliseconds) to display the error notice.
        errorDuration: 2500,

        // Attribute to retrieve the zoom image URL from.
        linkAttribute: 'href',

        // Prevent clicks on the zoom image link.
        preventClicks: true,

        // Callback function to execute before the flyout is displayed.
        beforeShow: $.noop,

        // Callback function to execute before the flyout is removed.
        beforeHide: $.noop,

        // Callback function to execute when the flyout is displayed.
        onShow: $.noop,

        // Callback function to execute when the flyout is removed.
        onHide: $.noop,

        // Callback function to execute when the cursor is moved while over the image.
        onMove: $.noop

    };

    /**
     * EasyZoom
     * @constructor
     * @param {Object} target
     * @param {Object} options (Optional)
     */
    function EasyZoom(target, options) {
        this.$target = $(target);
        this.opts = $.extend({}, defaults, options, this.$target.data());

        this.isOpen === undefined && this._init();
    }

    /**
     * Init
     * @private
     */
    EasyZoom.prototype._init = function() {
        this.$link   = this.$target.find('span');
        this.$image  = this.$target.find('img');

        this.$flyout = $('<div class="easyzoom-flyout" />');
        this.$closebtn = $('<a id="closebtn" href="javascript:void(0)" class="closebtn" >&times;</a>');
        this.$notice = $('<div class="easyzoom-notice" />');

        this.$target.on({
            'mousemove.easyzoom touchmove.easyzoom': $.proxy(this._onMove, this),
            'mousedown.easyzoom touchstart.easyzoom': $.proxy(this._onEnter, this),
            'mousedown.easyzoom-flyout': $.proxy(this._onClick, this),
            'mousedown.closebtn': $.proxy(this._onClick, this)
        });

        this.opts.preventClicks && this.$target.on('click.easyzoom', function(e) {
            e.preventDefault();
        });
    };

    /**
     * Show
     * @param {MouseEvent|TouchEvent} e
     * @param {Boolean} testMouseOver (Optional)
     */
    EasyZoom.prototype.show = function(e, testMouseOver) {
        var w1, h1, w2, h2;
        var self = this;

        if (this.opts.beforeShow.call(this) === false) return;
        $('body').css('overflow','hidden');

        if (!this.isReady) {
            return this._loadImage(this.$link.attr(this.opts.linkAttribute), function() {
                if (self.isMouseOver || !testMouseOver) {
                    self.show(e);
                }
            });
        }

        this.$target.append(this.$flyout);

        w1 = this.$target.width();
        h1 = this.$target.height();

        w2 = this.$flyout.width();
        h2 = this.$flyout.height();

        dw = this.$zoom.width() - w2;
        dh = this.$zoom.height() - h2;

        this.$target.append(this.$closebtn);

        // For the case where the zoom image is actually smaller than
        // the flyout.
        if (dw < 0) dw = 0;
        if (dh < 0) dh = 0;

        rw = dw / w1;
        rh = dh / h1;

        this.isOpen = true;

        this.opts.onShow.call(this);

        e && this._move(e);
    };

    /**
     * On enter
     * @private
     * @param {Event} e
     */
    EasyZoom.prototype._onEnter = function(e) {
        var touches = e.originalEvent.touches;

        this.isMouseOver = true;

        if (!touches || touches.length == 1) {
            e.preventDefault();
            this.show(e, true);
        }
    };

    /**
     * On move
     * @private
     * @param {Event} e
     */
    EasyZoom.prototype._onMove = function(e) {
        if (!this.isOpen) return;

        e.preventDefault();
        this._move(e);
    };

    /**
     * On leave
     * @private
     */
    EasyZoom.prototype._onLeave = function() {
        this.isMouseOver = false;
        this.isOpen && this.hide();
    };

    EasyZoom.prototype._onClick = function() {
        if (!this.isOpen) return;
        if (this.opts.beforeHide.call(this) === false) return;

        this.isReady = false;

        this.$flyout.detach();
        this.$closebtn.detach();
        this.isOpen = false;

        this.opts.onHide.call(this);
        $('body').css('overflow','auto');

    };

    /**
     * On load
     * @private
     * @param {Event} e
     */
    EasyZoom.prototype._onLoad = function(e) {
        // IE may fire a load event even on error so test the image dimensions
        if (!e.currentTarget.width) return;

        this.isReady = true;

        this.$notice.detach();
        this.$flyout.html(this.$zoom);
        this.$target.removeClass('is-loading').addClass('is-ready');

        e.data.call && e.data();
    };

    /**
     * On error
     * @private
     */
    EasyZoom.prototype._onError = function() {
        var self = this;

        this.$notice.text(this.opts.errorNotice);
        this.$target.removeClass('is-loading').addClass('is-error');

        this.detachNotice = setTimeout(function() {
            self.$notice.detach();
            self.detachNotice = null;
        }, this.opts.errorDuration);
    };

    /**
     * Load image
     * @private
     * @param {String} href
     * @param {Function} callback
     */
    EasyZoom.prototype._loadImage = function(href, callback) {
        var zoom = new Image;

        this.$target
            .addClass('is-loading')
            .append(this.$notice.text(this.opts.loadingNotice));

        this.$zoom = $(zoom)
            .on('error', $.proxy(this._onError, this))
            .on('load', callback, $.proxy(this._onLoad, this));

        zoom.style.position = 'absolute';
        zoom.src = href;
    };

    /**
     * Move
     * @private
     * @param {Event} e
     */
    EasyZoom.prototype._move = function(e) {

        if (e.type.indexOf('touch') === 0) {
            var touchlist = e.touches || e.originalEvent.touches;
            lx = touchlist[0].pageX;
            ly = touchlist[0].pageY;
        } else {
            lx = e.pageX || lx;
            ly = e.pageY || ly;
        }

        var offset  = this.$target.offset();
        var pt = ly - offset.top;
        var pl = lx - offset.left;
        var xt = Math.ceil(pt * rh);
        var xl = Math.ceil(pl * rw);

        // Close if outside
        if (xl < 0 || xt < 0 || xl > dw || xt > dh) {
            //this.hide();
        } else {
            var top = xt * -1;
            var left = xl * -1;

            this.$zoom.css({
                top: top,
                left: left
            });

            this.opts.onMove.call(this, top, left);
        }

    };

    /**
     * Hide
     */
    EasyZoom.prototype.hide = function() {
        if (!this.isOpen) return;
        if (this.opts.beforeHide.call(this) === false) return;

        this.$flyout.detach();
        this.isOpen = false;

        this.opts.onHide.call(this);
        $('body').css('overflow','auto');
    };

    /**
     * Swap
     * @param {String} standardSrc
     * @param {String} zoomHref
     * @param {String|Array} srcset (Optional)
     */
    EasyZoom.prototype.swap = function(standardSrc, zoomHref, srcset) {
        this.hide();
        this.isReady = false;

        this.detachNotice && clearTimeout(this.detachNotice);

        this.$notice.parent().length && this.$notice.detach();

        this.$target.removeClass('is-loading is-ready is-error');

        this.$image.attr({
            src: standardSrc,
            srcset: $.isArray(srcset) ? srcset.join() : srcset
        });

        this.$link.attr(this.opts.linkAttribute, zoomHref);
    };

    /**
     * Teardown
     */
    EasyZoom.prototype.teardown = function() {
        this.hide();

        this.$target
            .off('.easyzoom')
            .removeClass('is-loading is-ready is-error');

        this.detachNotice && clearTimeout(this.detachNotice);

        delete this.$link;
        delete this.$zoom;
        delete this.$image;
        delete this.$notice;
        delete this.$flyout;

        delete this.isOpen;
        delete this.isReady;
    };

    // jQuery plugin wrapper
    $.fn.easyZoom = function(options) {
        return this.each(function() {
            var api = $.data(this, 'easyZoom');

            if (!api) {
                $.data(this, 'easyZoom', new EasyZoom(this, options));
            } else if (api.isOpen === undefined) {
                api._init();
            }
        });
    };
}));
// End of [edited] Easyzoom function


// Beginning of Recrafting Craft specific functions
/*!
 * @name        Recrafting Craft
 * @author      studio MEGAN <>
 * @modified    2018
 */


// On opening of page execute these functions
$(document).ready(function() {
  nozoom();
}); 

// Disable zoom function when page is opened on a phone
function nozoom() {
    if ( $(window).width() < 788) {
        $('#georg1').hide();
        $('#georg11').show();
        $('#georg2').hide();
        $('#georg21').show();
        $('#georg3').hide();
        $('#georg31').show();
        $('#georg4').hide();
        $('#georg41').show();
        $('#georg5').hide();
        $('#georg51').show();
        $('#georg6').hide();
        $('#georg61').show();
    }
}

// Hide and open Side Navigation Menu
function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// When a Side Navigation Menu Item is clicked scroll to the top of the page
function scrollTop(id) {
  $('html, body').animate({
            scrollTop: $(id).offset().top -100 }, 'slow');
}

/** 
    Recrafting Craft consists of 8 parts, all of equal importance.
    The webpage is build up with 8 blocks. 
    The content of these blocks changes when a Side Navigation Menu Item is clicked.
    In the first block the clicked item is places, the rest randomises in the remaining blocks.
*/

// Shuffle the Array created in the next function
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


// The content of the blocks in variables
var biotech = document.getElementById("biotechschool").innerHTML,   
    natural = document.getElementById("naturalschool").innerHTML,
    high = document.getElementById("highschool").innerHTML,
    museum = document.getElementById("museumschool").innerHTML,
    engineer = document.getElementById("engineerschool").innerHTML,
    no = document.getElementById("noschool").innerHTML,
    oscar = document.getElementById("oscar").innerHTML,
    bibi = document.getElementById("bibi").innerHTML,
    mascha = document.getElementById("mascha").innerHTML,
    jose = document.getElementById("jose").innerHTML,
    dirk = document.getElementById("dirk").innerHTML,
    fibl = document.getElementById("fibl"),
    firstblock = document.getElementById("firstblock"),
    secondblock = document.getElementById("secondblock"),
    thirdblock = document.getElementById("thirdblock"),
    fourthblock = document.getElementById("fourthblock"),
    fifthlock = document.getElementById("fifthlock"),
    sixtblock = document.getElementById("sixtblock"),
    seventblock = document.getElementById("seventblock"),
    eightblock = document.getElementById("eightblock"),
    ninthblock = document.getElementById("ninthblock"),
    tentblock = document.getElementById("tentblock");

// On opening of page set standard order for the content in the blocks
window.onload = beginblocks()

// Reload function
function reload() {
    location.reload(); 
}

// The standard order for when the page is opened
function beginblocks() {
    fibl.innerHTML = jose;
    firstblock.innerHTML = mascha;
    secondblock.innerHTML = dirk;
    thirdblock.innerHTML = biotech;
    fourthblock.innerHTML = engineer;
    fifthlock.innerHTML = museum;
    sixtblock.innerHTML = high;
    seventblock.innerHTML = natural;
    eightblock.innerHTML = no;
    ninthblock.innerHTML = bibi;
    tentblock.innerHTML = oscar;
    scrollTop(fibl);
}

// Place all content except the clicked item in an array, randomise the order in the array so each item has a random number. Combine number with a block and place the content.
function changeText(id, a) {
    var arr = [biotech, natural, high, museum, engineer, no, oscar, bibi, mascha, jose, dirk];
    var arr2 = [];
    if(a === biotech) {
        var b = biotech;
        arr.splice(0, 1);
        arr2 = shuffle(arr);
    }
    else if(a === natural) {
        var b = natural;
        arr.splice(1, 1);
        arr2 = shuffle(arr);
    }
    else if(a === high) {
        var b = high;
        arr.splice(2, 1);
        arr2 = shuffle(arr);
    }
    else if(a === museum) {
        var b = museum;
        arr.splice(3, 1);
        arr2 = shuffle(arr);
    }
    else if(a === engineer) {
        var b = engineer;
        arr.splice(4, 1);
        arr2 = shuffle(arr);
    }
    else if(a === no) {
        var b = no;
        arr.splice(5, 1);
        arr2 = shuffle(arr);
    }
    else if(a === oscar) {
        var b = oscar;
        arr.splice(6, 1);
        arr2 = shuffle(arr);
    }
    else if(a === bibi) {
        var b = bibi;
        arr.splice(7, 1);
        arr2 = shuffle(arr);
    }
    else if(a === mascha) {
        var b = mascha;
        arr.splice(8, 1);
        arr2 = shuffle(arr);
    }
    else if(a === jose) {
        var b = jose;
        arr.splice(9, 1);
        arr2 = shuffle(arr);
    }
    else if(a === dirk) {
        var b = dirk;
        arr.splice(10, 1);
        arr2 = shuffle(arr);
    }
    id.innerHTML = b;
    firstblock.innerHTML = arr2[0];
    secondblock.innerHTML = arr2[1];
    thirdblock.innerHTML = arr2[2];
    fourthblock.innerHTML = arr2[3];
    fifthlock.innerHTML = arr2[4];
    sixtblock.innerHTML = arr2[5];
    seventblock.innerHTML = arr2[6];
    eightblock.innerHTML = arr2[7];
    ninthblock.innerHTML = arr2[8];
    tentblock.innerHTML = arr2[9];
    scrollTop(fibl);
    var arr = [biotech, natural, high, museum, engineer, no, oscar, bibi, mascha, jose, dirk];
    var $easyzoom = $('.easyzoom').easyZoom();
}

// Remove blue class to all keywords
function removeBlue() {
    $('.biotech, .natural, .high, .museum, .engineer, .no, .oscar, .bibi, .mascha, .jose, .dirk, .colophon, .mascha').removeClass("blue");
}

// Add blue class to active keywords
var biotechc = document.getElementsByClassName("biotech"),
    naturalc = document.getElementsByClassName("natural"),
    highc = document.getElementsByClassName("high"),
    museumc = document.getElementsByClassName("museum"),
    engineerc = document.getElementsByClassName("engineer"),
    noc = document.getElementsByClassName("no"),
    oscarc = document.getElementsByClassName("oscar"),
    bibic = document.getElementsByClassName("bibi"),
    maschac = document.getElementsByClassName("mascha"),
    josec = document.getElementsByClassName("jose"),
    dirkc = document.getElementsByClassName("dirk"),
    colophonc = document.getElementsByClassName("colophon");
function chbg(id) {
    if(id === biotechc) {
        removeBlue();
        $('.biotech').addClass("blue");
    }
    if(id === naturalc) {
        removeBlue();
        $('.natural').addClass("blue");
    }
    if(id === highc) {
        removeBlue();
        $('.high').addClass("blue");
    }
    if(id === museumc) {
       removeBlue();
        $('.museum').addClass("blue");
    }
    if(id === engineerc) {
        removeBlue();
        $('.enginer').addClass("blue");
    }
    if(id === noc) {
        removeBlue();
        $('.no').addClass("blue");
    }
    if(id === oscarc) {
        removeBlue();
        $('.oscar').addClass("blue");
    }
    if(id === bibic) {
        removeBlue();
        $('.bibi').addClass("blue");
    }
    if(id === maschac) {
        removeBlue();
        $('.mascha').addClass("blue");
    }
    if(id === josec) {
        removeBlue();
        $('.jose').addClass("blue");
    }
    if(id === colophonc) {
        removeBlue();
        $('.colophon').addClass("blue");
    }
    if(id === dirkc) {
        removeBlue();
        $('.dirk').addClass("blue");
    }
}

// Scroll to colophon
$("#colophonbutt").click(function() {
    $('html, body').animate({
        scrollTop: $("#colophon").offset().top
    }, 2000);
});

// Main-head arrow is clickable
$("#arrowscrollmascha").click(function(){
    $('html,body').animate({
      scrollTop: $("#headerfade").fadeOut()},
      'slow');
    document.body.style.overflow = 'visible';
});

// Esc key is close for Side Navigation Menu
$(document).keyup(function(e) {
     if (e.keyCode == 27) { 
       closeNav();
    }
});

// Slide open content of div on click
$(document).ready(function(){
    $("#contents").click(function(){
        $("#contentscontents").slideToggle("slow");
        $("#contents .contentsarrow").toggleClass("rotate");
    });
    $("#index").click(function(){
        $("#contentsindex").slideToggle("slow");
        $("#index .contentsarrowdown").toggleClass("rotate");
    });
});
