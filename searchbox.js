jQuery(function($) {
    var $q            = $('#q'),
        $qSecondary  = $('#q-secondary'),
        $searchInputs = $('.q'),
        $searchForm   = $('#search_form'),
        $body         = $('body'),
        $title        = $('title'),
        $voice        = $('.speech'),
        $voicepop     = $('#voicepop'),
        $close        = $('#close'),
        $info         = $('#info'),
        $voiceImg     = $('#voiceImg'),
        $circle       = $('.micCircle'),

        $tabSwitches  = $searchForm.find('.tabs_switch');
        noSpeech = "Please check your microphone and audio level.    </br>  <a href=https://support.google.com/websearch/answer/2940021?visit_id=1-636113651372976435-954695021&p=ui_voice_search&rd=2=>Learn more</a>";
        var ignore_onend;
        var recognition;
        var bPopup;
        if ($q.val()) $body.removeClass('no-query');
        $close.on('click',function() {
          recognition.stop();
          bPopup.close();
        });
        $voice.on('click',function() {
          bPopup = $voicepop.bPopup({
            //modalClose: false,
            opacity: 0.2,
            positionStyle: 'fixed',//'fixed' or 'absolute'
            onClose: function() {
              $('body').css('overflow','auto');
            }
          });
          $('body').css('overflow','hidden');
          $voicepop.css('top', '0px');
          $info.html("Speak Now");
          if (window.hasOwnProperty('webkitSpeechRecognition')) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";
            $voicepop.show();
            recognition.start();
            setTimeout(function () {
              $info.html("Listening...");
            }, 1200);
            recognition.onerror = function(event) {
              console.log(event);
              if (event.error == 'no-speech') {
                $info.html('No microphone was found. microphone settings</a> are configured correctly.');
                $info.html(noSpeech);
                $circle.hide();
                ignore_onend = true;
              }
              if (event.error == 'audio-capture') {
                $info.html('No microphone was found. microphone settings</a> are configured correctly.');
                ignore_onend = true;
              }
              if (event.error == 'not-allowed') {
                if (event.timeStamp - start_timestamp < 5000) {
                  $info.html('No microphone was found. microphone settings</a> are configured correctly.');
                  ignore_onend = true;
                  showInfo('info_blocked');
                } else {
                  $info.html('No microphone was found. microphone settings</a> are configured correctly.');
                  ignore_onend = true;
                  showInfo('info_denied');
                }
                ignore_onend = true;
              }
            };
            recognition.onend = function() {
              if (ignore_onend) {
                return;
              }
              else {
                recognition.stop();
                bPopup.close();
              }
            };

        recognition.onresult = function(e) {
          recognition.stop();
          bPopup.close();
          $circle.show();
          $('body').css('overflow','auto');
          $q.val(e.results[0][0].transcript);
          var qVal = SERP.methods.stripHtml(e.results[0][0].transcript),
              q    = encodeURIComponent(qVal),
              cat  = $searchForm.find('.tabs_switch.active').attr('href'),
              page = 1;
              recognition.stop();
          if (!q) return false;

          SERP.methods.startRouting({
              cat: cat, q: q, page: page
          });

          $title.html(SERP.methods.clearHTML(qVal) + ' &mdash; Xfinity.com Search');

          $('#search_form-secondary').removeClass('hidden');
          return;
        };
      }
    });
        $tabSwitches  = $searchForm.find('.tabs_switch');

    if ($q.val()) $body.removeClass('no-query');
    $searchForm.on('submit', function () {
        var qVal = SERP.methods.stripHtml($q.val()),
            q    = encodeURIComponent(qVal),
            cat  = $searchForm.find('.tabs_switch.active').attr('href'),
            page = 1;

        if (!q) return false;

        // At the moment, loading of the modules is handled by the router
        // SERP.methods.loadModules(SERP.models, {
        //     filter: {
        //         category: cat
        //     }
        // });
        if(lastSearchTerm == undefined && lastSearchTerm != qVal && $(".blinking-effect").length){
            $(".blinking-effect").removeClass("show");
            lastSearchTerm = qVal;
        }

        SERP.methods.startRouting({
            cat: cat, q: q, page: page
        });

        $title.html(SERP.methods.clearHTML(qVal) + ' &mdash; Xfinity.com Search');

        $('#search_form-secondary').removeClass('hidden');
        return false;
    });


    $tabSwitches.on('click', function (e) {
        var con,
            $this = $(this),
            q     = encodeURIComponent($q.val()),
            cat   = $this.attr('href');


        if (cat === "images") {
            con = $('#con').val();
            location.href = "/image/#params/q=" + q + "/0";
            return false;
        };

        DTM.setDTMClickInfo(e.target);

        $tabSwitches.removeClass('active');
        $(this).addClass('active');

        $body
            .removeClass('cat-web cat-support cat-xfinitytv cat-images')
            .addClass('cat-' + cat);

        SERP.category = cat;

        SERP.methods.startRouting({
            cat: cat, q: q, page: 1
        });

        e.preventDefault();
    });

    $('#search_form-secondary').on('submit', function() {
        $q.val(SERP.methods.stripHtml($qSecondary.val()));
        $searchForm.submit();
        return false;
    });

    $searchInputs.on('change keyup', function () {
        SERP.query = SERP.methods.stripHtml($(this).val());
    });

    $('html').on('click', 'body:not(.cat-xfinitytv) .query_item_link', function (e) {
        $q.val($(this).data('rel'));
        $searchForm.submit();
        e.preventDefault();
    });

    SERP.methods.startRouting();
    var lastSearchTerm = SERP.methods.stripHtml($q.val());
    if ($('.tabs_switch.active').attr('href') === 'web') {
        SERP.promotions.checkPromotions(lastSearchTerm);
    }
});
