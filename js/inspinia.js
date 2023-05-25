/**
 * INSPINIA - Responsive Admin Theme
 * 2.6.2
 *
 * Custom scripts
 */

$(document).ready(function () {

    // Full height of sidebar
    function fix_height() {
        var heightWithoutNavbar = $("body > #wrapper").height() - 61;
        $(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");

        var navbarHeigh = $('nav.navbar-default').height();
        var wrapperHeigh = $('#page-wrapper').height();

        if (navbarHeigh > wrapperHeigh) {
            $('#page-wrapper').css("min-height", navbarHeigh - 61 + "px");
        }

        if (navbarHeigh < wrapperHeigh) {
            $('#page-wrapper').css("min-height", $(window).height() - 61 + "px");
        }

        if ($('body').hasClass('fixed-nav')) {
            if (navbarHeigh > wrapperHeigh) {
                $('#page-wrapper').css("min-height", navbarHeigh - 61 + "px");
            } else {
                $('#page-wrapper').css("min-height", $(window).height() - 60 - 61 + "px");
            }
        }

    }


    $(window).bind("load resize scroll", function () {
        if (!$("body").hasClass('body-small')) {
            fix_height();
        }
    });

    // Move right sidebar top after scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav')) {
            $('#right-sidebar').addClass('sidebar-top');
        } else {
            $('#right-sidebar').removeClass('sidebar-top');
        }
    });


    setTimeout(function () {
        fix_height();
    }, 1000);

    // Minimalize menu when screen is less than 76
    $(function () {
        $(window).bind("load resize", function () {
            if ($(document).width() < 769) {
                $('body').addClass('body-small')
            } else {
                $('body').removeClass('body-small')
            }
        })
    })
    $(function () {
        var close = window.swal.close;
        window.swal.close = function () {
            close();
            window.onkeydown = null;
        };
    })
    // setInterval(function () {
    //     var inputs = $(':input:visible:enabled').keyup(function (e) {
    //         if (e.which == 9) {
    //             e.preventDefault();
    //             var nextInput = inputs.get(inputs.index(this) + 1);
    //             if (!nextInput) {
    //                 nextInput = inputs.get(0);
    //             }
    //             nextInput.focus();
    //         }
    //     });
    // }, 1000)
});
