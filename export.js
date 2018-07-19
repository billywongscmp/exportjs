/* This file contains the export logic! */
console.log('localhost :)')
//Set up clipboard
var clipboard = new Clipboard(".copy-me");

clipboard.on("success", function(e) {
  e.clearSelection();
  $(".modal.is-active footer").after(
    '<div class="notification is-success"><button class="delete"></button>Successfully copied to clipboard!</div>'
  );
  $(".modal.is-active .notification .delete").click(function() {
    $(this)
      .parent()
      .remove();
  });
});

var $cardContainer;
var cdStyle = $(
  "<style>.countdown { -webkit-font-smoothing: antialiased; line-height: 1; font-family: Barlow, sans-serif; position: absolute; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); color: #F8008E; padding: 30px 0; z-index: 1; text-align: center; } .countdown .header-cd { font-size: 16px; font-weight: bold; line-height: 1; margin-bottom: 6px; color: #FFF; } .countdown .text { margin-bottom: 16px; font-family: 'Bungee'; font-size: 28px; color: #00E8FF; } .countdown .hold { width: 50px; margin-bottom: 2px; display: inline-block; } .countdown .text-in { height: 9px; font-size: 8px; font-weight: bold; text-transform: uppercase; } .countdown .number { height: 25px; font-size: 22px; } @media (max-width: 1023px) { .countdown { bottom: 15.4%; padding: 20px 0; z-index: 10; } } @media (min-width: 1024px) { .countdown .header-cd {font-size: 28px;} .countdown .text { font-size: 60px; margin-bottom: 24px; } .countdown .hold svg { height: 52px; width: auto; } .countdown .text-in { font-size: 12px; height: auto; } .countdown .number { font-size: 32px; height: auto; } }</style>"
);
var $containerClone;
jQuery.fn.reverse = [].reverse;

/**
 * Make sure the correct images are showing on the image export div.
 *
 * @param {type} the type of image Desktop or Mobile
 */
function ensureCorrectImages(type) {
  //both-with-different
  $(".rc-exporter")
    .contents()
    .find(".both-with-different")
    .each(function() {
      $(this).css(
        "background-image",
        $(this).attr("both-with-different" + type)
      );
    });
}

/**
 * Check a string nad make sure it is transparent
 *
 * @param {transtring} color value string
 * @returns true = non-transparency false = transparent
 */
function CheckStringforTransparency(transtring) {
  //true = not transparent
  if (
    transtring.includes("hsva") == true ||
    transtring.includes("rgba") == true
  ) {
    if (transtring.includes("1)") == true) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

/**
 * Take Prepared export container and create images for FINAL card export.
 *
 */
function createCardImageAndFinalExport() {
  ensureCorrectImages("mobile");

  //Take Screenshot of image (mobile)
  $(".rc-exporter")
    .contents()
    .find("body")
    .css("height", "838px")
    .css("width", "562.5px")
    .css("zoom", "1.5");
  var node = document.getElementById("rc-exporter").contentWindow.document.body;
  var counts = {};

  //If there are any layers to be removed, remove em.
  removeAllLayerArray.forEach(function(x) {
    counts[x.card] = (counts[x.card] || 0) + 1;
  });
  $.each(counts, function(index, value) {
    if (value == 2) {
      var passOnIndex = index;
      var FoundandRemove = false;
      var $cards = $(".responsive-container")
        .contents()
        .find("[data-type]")
        .reverse();
      $cards.each(function(index) {
        if (FoundandRemove == true) {
          $('[data-card-id="' + $(this).attr("data-card") + '"]')
            .find(".remove-card")
            .click();
          $(this).remove();
          $cardContainer
            .find('[data-card="' + $(this).attr("data-card") + '"]')
            .remove();
          $cardContainer.find(".style" + $(this).attr("data-card")).remove();
        }
        if ($(this).attr("data-card") == passOnIndex) {
          FoundandRemove = true;
        }
      });
    }
  });

  $(".scmp-loader .text").text("Exporting Mobile Image..");
  $(".rc-exporter")
    .contents()
    .find("[data-type]")
    .css("display", "block");
  domtoimage
    .toJpeg(node, {
      quality: 0.9
    })
    .then(function(dataUrl) {
      var dataMobile = dataUrl; // Mobile Exported Image

      //Prep and export desktop Image
      ensureCorrectImages("desktop");
      $(".rc-exporter")
        .contents()
        .find("body")
        .css("height", "972px")
        .css("width", "1728px")
        .css("zoom", "1.2");
      $(".size-laptop").click();
      $(".scmp-loader .text").text("Exporting Desktop Image..");

      var fontFixer = $('<div style="color: transparent"></div>');
      $("[data-input=font-family]")
        .filter(":first")
        .find("option")
        .each(function() {
          fontFixer.append(
            "<span style='font-family: " + $(this).val() + ";'>x</span>"
          );
        });
      $("[data-input=font-weight]")
        .filter(":first")
        .find("option")
        .each(function() {
          fontFixer.append(
            "<span style='font-family: Barlow; font-weight: " +
              $(this).val() +
              ";'>x</span>"
          );
        });
      $(".rc-exporter")
        .contents()
        .find("body")
        .append(fontFixer);
      var node2 = document.getElementById("rc-exporter").contentWindow
        .document.body;
      domtoimage
        .toJpeg(node2, {
          quality: 0.9
        })
        .then(function(dataUrl) {
          $(".scmp-loader")
            .css("opacity", "0")
            .delay("1000")
            .fadeOut("0");

          //Set up the export code with Progressive Load images.
          $.each(processLoadedImages, function(index, value) {
            ccHtml = $cardContainer.html();
            ccHtml = ccHtml.replace(
              'url("' + value.ogURL + '")',
              'url("' + value.image + '")'
            );
            $cardContainer.html(ccHtml);

            if (value.ogURL !== null) {
              if (value.mediaquery == "desktop") {
                $cardContainer
                  .find(value.identifier)
                  .attr("data-image-url-desktop", value.ogURL);
              } else {
                $cardContainer
                  .find(value.identifier)
                  .attr("data-image-url-mobile", value.ogURL);
              }
            }
          });

          var dataLaptop = dataUrl;

          //Set the session storage item and send to drupal.
          localStorage.setItem(
            "scmp-node-" + nid,
            JSON.stringify({
              x: new Date().getTime(),
              cards: [
                {
                  v: $cardContainer.get(0).outerHTML,
                  img: {
                    size1: dataMobile,
                    size2: dataLaptop
                  },
                  layerimg: processBGArray
                }
              ]
            })
          );
          $("body").removeClass("importing");
          $(".rc-exporter").css("display", "none");
          $(".scmp-loader .text").text("");
          $(".export-modal pre").text($cardContainer.get(0).outerHTML);
        });
    })
    .catch(function(error) {
      console.error("oops, something went wrong!", error);
      JSON.stringify({
        x: new Date().getTime(),
        cards: [
          {
            v: $cardContainer.get(0).outerHTML
          }
        ]
      });
      $(".rc-exporter").css("display", "none");
      $(".scmp-loader .text").text("");
      $(".scmp-loader")
        .css("opacity", "0")
        .delay("1000")
        .fadeOut("0");
    });
}

/**
 * Start the image export process, this includes preparing the progressive images and exporting
 * the main card images.
 */
function runImageExport() {
  //Tidy up image for desktop, then start the doSynchronousLoop Loop to finish up the export.
  $(".rc-exporter").css("display", "block");
  $(".rc-exporter")
    .contents()
    .find("body")
    .css("height", "838px")
    .css("width", "562.5px")
    .css("zoom", "1.5");
console.log('processBackgroundImages!!')
  doSynchronousLoop(
    $("*[data-input=background-image]"),
    processBackgroundImages,
    createCardImageAndFinalExport
  );
}

function doSynchronousLoop(data, processData, done) {
  console.log(processData.name)
  if (data.length > 0) {
    // var loop = function(data, i, processData, done) {
    //   console.log('loop', processData.name)
    //   processData(data[i], i, function() {
    //     if (++i < data.length) {
    //       setTimeout(function() {
    //         loop(data, i, processData, done);
    //       }, 0);
    //     } else {
    //       done();
    //     }
    //   }, () => { console.log('tmp resolve') });
    // };
    // loop(data, 0, processData, done);

    (function loop(i) {
      console.log('call lop')
      if (i < data.length) {
        new Promise(function(resolve, reject) {
          return processData(data[i], i, function() {
              console.log('callback :)')
          }, resolve)
        }).then(function() {
          console.log(i, 'then')
          loop(i+1);
        });
      } else {
        console.log('done a')
        done()
      }
    })(0);
  } else {
    console.log('done b')
    done();
  }
}

var removeAllLayerArray = [];
/**
 * Function to create array to remove all layers below a 100% background layer.
 *
 * @param {$card} The card component with data
 * @param {input} the Layer bbackground input
 * @param ($cardRendered) rendered Card in export div
 * @param (bg) true = non transparent background image, otherwise no image.
 */
function prepareLayerRemovalArray($card, input, $cardRendered, bg) {
  // if bg is true we know it is a non transparent bg image, otherwise it has no bg image.

  // removebehind must be greater than 0 (confirms if is a bg or has BG color)
  var removeBehind = 0;

  // requiredRB is the needed to qualify for require, must equal 4. (bg-true, opacity=1, media-query=both, width & height 100)
  var requiredRB = 0;
  if (
    ($card.find('[data-input="opacity"]').val() == 1 &&
      $card.find('[data-input-desktop="opacity"]').val() == 1) ||
    $card.find('[data-input-desktop="opacity"]').val() == undefined
  ) {
    requiredRB += 1;
    //not transparent.
  }

  // ensure media query is for both.
  var state = $card.find("input[name^=media-query]:checked").val();
  if (state == "none") {
    requiredRB += 1;
  }

  // ensure is BG true on mobbile
  if ($card.find(".card-header-title").hasClass("bg-true")) {
    requiredRB += 1;
  }

  if (
    $card.find('[data-input-desktop="width"]').val() == 100 &&
    $card.find('[data-input="width"]').val() == 100
  ) {
    if (
      $card.find('[data-input="height"]').val() == 100 &&
      $card.find('[data-input-desktop="height"]').val() == 100
    ) {
      requiredRB += 1;
    }
  }

  if ((bg = true)) {
    removeBehind += 1;
  }

  //check bg color
  if (
    CheckStringforTransparency(
      $card.find('[data-input="background-color"]').val()
    ) == true
  ) {
    removeBehind += 1;
  }

  if (requiredRB == 4 && removeBehind > 0) {
    removeAllLayerArray.push({
      card: $card.attr("data-card-id")
    });
  }
}

/**
 * Converts html image src into base64 images to ensure dom2image.js works correctly.
 */
function convertImagesToBase64(element, i, callback, resolve) {
  console.log('convertImagesToBase64', i)
  $(".scmp-loader .text").text("Preparing Images for export..");
  var input = $(element);
  var $card = input.parents(".card");
  var xhr = new XMLHttpRequest();
  var xhrMBG = new XMLHttpRequest();
  var $cardRendered = $(".responsive-container")
    .contents()
    .find(".x" + $card.attr("data-card-id") + "");
  var bothWithDifferent = false;
  var thisInputAttr = input.attr("data-input");

  // Check card background rules and if they are different (for image export).
  if (
    $card.find("[data-input-desktop=background-image]").val() !== "null" &&
    $card.find('[data-input="background-image"]').val() !== null &&
    ($card.find("[data-input=background-image]").val() !== "null" &&
      $card.find('[data-input="background-image"]').val() !== null) &&
    $card.find("[data-input-desktop=background-image]").val() !==
      $card.find("[data-input=background-image]").val()
  ) {
    bothWithDifferent = true;
    $(".rc-exporter")
      .contents()
      .find('[data-card="' + $card.attr("data-card-id") + '"]')
      .addClass("both-with-different");
    if (thisInputAttr == "background-image") {
      thisInputAttr = "mobile";
    } else {
      thisInputAttr = "desktop";
    }
  }

  /**
   * Check that a png image has transparent pixels or not
   *
   */
  function checkTransparency(buffer) {
    var view = new DataView(buffer);

    // is a PNG?
    if (view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a) {
      // We know format field exists in the IHDR chunk. The chunk exists at
      // offset 8 +8 bytes (size, name) +8 (depth) & +9 (type)
      var depth = view.getUint8(8 + 8 + 8);
      var type = view.getUint8(8 + 8 + 9);

      var confirm = {
        depth: depth,
        type: ["G", "", "RGB", "Indexed", "GA", "", "RGBA"][type],
        buffer: view.buffer,
        hasAlpha: type === 4 || type === 6 // grayscale + alpha or RGB + alpha
      };

      if (confirm.hasAlpha == false) {
        prepareLayerRemovalArray($card, input, $cardRendered, true);
      }
    } else {
      prepareLayerRemovalArray($card, input, $cardRendered, true);
    }
  }

  //This part downloads the image and updates the exporter content so we can switch between the images easily.
  xhrMBG.responseType = "arraybuffer";
  xhr.responseType = "arraybuffer";

  //Desktop Image Load
  xhr.onload = function(e) {
    if (this.status == 200) {
      checkTransparency(this.response);
      var uInt8Array = new Uint8Array(this.response);
      var i = uInt8Array.length;
      var binaryString = new Array(i);
      while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
      }
      var data = binaryString.join("");
      var base64 = window.btoa(data);

      if (bothWithDifferent == true) {
        $(".rc-exporter")
          .contents()
          .find('[data-card="' + $card.attr("data-card-id") + '"]')
          .attr(
            "both-with-different" + thisInputAttr,
            'url("data:image/png;base64,' +
              base64.replace(/(\r\n|\n|\r)/gm, "") +
              '")'
          );
      }

      $(".rc-exporter")
        .contents()
        .find('[data-card="' + $card.attr("data-card-id") + '"]')
        .css(
          "background-image",
          'url("data:image/png;base64,' +
            base64.replace(/(\r\n|\n|\r)/gm, "") +
            '")'
        )
        .css("background-repeat", "no-repeat");
      if (
        $cardRendered.attr("background-blend-url") &&
        $cardRendered.attr("background-blend-url-2") &&
        $cardRendered.attr("background-blend-url-2") !== "null"
      ) {
        xhrMBG.open("GET", $cardRendered.attr("background-blend-url-2"), true);
        xhrMBG.send();
      } else {
        resolve();
        callback();
      }
    }
  };

  //Load Mobile version if Blend URL
  xhrMBG.onload = function(e) {
    if (this.status == 200) {
      checkTransparency(this.response);
      var uInt8Array = new Uint8Array(this.response);
      var i = uInt8Array.length;
      var binaryString = new Array(i);
      while (i--) {
        binaryString[i] = String.fromCharCode(uInt8Array[i]);
      }
      var data = binaryString.join("");
      var base64 = window.btoa(data);

      if (bothWithDifferent == true) {
        $(".rc-exporter")
          .contents()
          .find('[data-card="' + $card.attr("data-card-id") + '"]')
          .attr(
            "both-with-different" + thisInputAttr,
            $(".rc-exporter")
              .contents()
              .find('[data-card="' + $card.attr("data-card-id") + '"]')
              .css("background-image") +
              ', url("data:image/png;base64,' +
              base64.replace(/(\r\n|\n|\r)/gm, "") +
              '")'
          );
      }

      $(".rc-exporter")
        .contents()
        .find('[data-card="' + $card.attr("data-card-id") + '"]')
        .css(
          "background-image",
          $(".rc-exporter")
            .contents()
            .find('[data-card="' + $card.attr("data-card-id") + '"]')
            .css("background-image") +
            ', url("data:image/png;base64,' +
            base64.replace(/(\r\n|\n|\r)/gm, "") +
            '")'
        );
      resolve();
      callback();
    }
  };

  if (input.val() !== "none" && input.val()) {
    xhr.open("GET", input.val(), true);
    xhr.send();
  } else {
    // If no image, add to remove all below Layer Array with no image.
    prepareLayerRemovalArray($card, input, $cardRendered, false);
    resolve();
    callback();
  }
}
var ccHtml;
var processBGArray = [];
var processLoadedImages = [];

/**
 * Update processloadedImages array to prepare final export code.
 *
 */
function prepareProcessLoadedImages(
  bgURL,
  dataURL,
  dataURLMini,
  $card,
  mediaquery
) {
  // Add information for layer rework.
  ccHtml = $cardContainer.html();
  var id = Math.floor(Math.random() * 1000) + 1000;

  if (mediaquery == "desktop" || mediaquery == "desktop-both") {
    $(".size-laptop").click();
  } else {
    $(".size-mobile").click();
  }
  var removeBlendImg = 'background-image: url("' + bgURL + '")';

  if (
    $(".responsive-container")
      .contents()
      .find('[data-card="' + $card.attr("data-card-id") + '"]')
      .css("background-image")
      .indexOf(",") > -1
  ) {
    removeBlendImg =
      'background-image: url("' +
      $(".responsive-container")
        .contents()
        .find('[data-card="' + $card.attr("data-card-id") + '"]')
        .attr("background-blend-url") +
      '"), url("' +
      $(".responsive-container")
        .contents()
        .find('[data-card="' + $card.attr("data-card-id") + '"]')
        .attr("background-blend-url-2") +
      '")';
  }
  if (mediaquery == "desktop-both") {
    mediaquery = "desktop";
    ccHtml =
      ccHtml +
      "<style>@media screen and (min-width: 1024px), (orientation: landscape) { .x" +
      $card.attr("data-card-id") +
      ' {background-image: url("' +
      dataURLMini +
      '")}}</style>';
  }
  ccHtml = ccHtml.replace(
    removeBlendImg,
    'background-image: url("%%' + id + '%%")'
  );
  $cardContainer.html(ccHtml);
  processBGArray.push({
    image: dataURL,
    identifier: id
  });
  processLoadedImages.push({
    image: dataURLMini,
    identifier: ".x" + $card.attr("data-card-id"),
    ogURL: "%%" + id + "%%",
    mediaquery: mediaquery
  });
}

/**
 * Process Background Images - Prepare progressive load Images and if background blend mode, create image of the blend mode layer.
 *
 */
function processBackgroundImages(element, i, callback, resolve) {
  console.log('processBackgroundImages', i)
  $(".scmp-loader .text").text(
    "Exporting Special Background Images with effects.."
  );
  var input = $(element);
  var $card = input.parents(".card");
  var blendMode = $card.find('[data-input="background-blend-mode"]').val();
  if ($card.find(".disable-progressive-load:checked").length > 0) {
    $cardContainer
      .find(".x" + $card.attr("data-card-id"))
      .addClass("prog-load-disabled")
      .removeAttr("v-card-progressive-image");
    callback();
    resolve();
  } else if (
    input.val() != "none" &&
    $card.find("input[name=disable-progressive-load]:not(:checked)")
  ) {
    var removeblendmode = "background-blend-mode: " + blendMode + ";";
    ccHtml = $cardContainer.html();
    ccHtml = ccHtml.replace(removeblendmode, "");
    $cardContainer.html(ccHtml);
    $cardContainer.find(".x" + $card.attr("data-card-id")).addClass("lazyload");
    ccHtml = $cardContainer.html();
    ensureCorrectImages("mobile");

    var link = document.createElement("a");

    //background blend required, recreate and export image.
    if ($card.attr("background-blend-needed")) {
      $(".rc-exporter")
        .contents()
        .find("[data-type]")
        .css("display", "none");
      $(".rc-exporter")
        .contents()
        .find('[data-card="' + $card.attr("data-card-id") + '"]')
        .css("display", "block");
      var node = document.getElementById("rc-exporter").contentWindow.document
        .body;
      if ($card.attr("data-media-query") !== "desktop") {
        $(".rc-exporter")
          .contents()
          .find("body")
          .css("height", "838px")
          .css("width", "562.5px")
          .css("zoom", "1.5");
        domtoimage
          .toJpeg(node, {
            quality: 0.85
          })
          .then(function(dataUrl) {
            var dataUrlOG = dataUrl;
            $(".rc-exporter")
              .contents()
              .find("body")
              .css("height", "56px")
              .css("width", "37px")
              .css("zoom", "0.1"); //x 0.1

            var node2 = document.getElementById("rc-exporter").contentWindow
              .document.body;
            domtoimage
              .toJpeg(node2, {
                quality: 0.6
              })
              .then(function(dataUrl) {
                prepareProcessLoadedImages(
                  input.val(),
                  dataUrlOG,
                  dataUrl,
                  $card,
                  "mobile"
                );

                if ($card.attr("data-media-query") !== "mobile") {
                  ensureCorrectImages("desktop");
                  $(".rc-exporter")
                    .contents()
                    .find("body")
                    .css("width", "1440px")
                    .css("height", "810px")
                    .css("zoom", "1"); //x2\

                  var node2 = document.getElementById("rc-exporter")
                    .contentWindow.document.body;
                  domtoimage
                    .toJpeg(node2, {
                      quality: 0.85
                    })
                    .then(function(dataUrl) {
                      var dataUrlOG = dataUrl;
                      $(".rc-exporter")
                        .contents()
                        .find("body")
                        .css("height", "81px")
                        .css("width", "144px")
                        .css("zoom", "0.1"); //x 0.1
                      var node2 = document.getElementById("rc-exporter")
                        .contentWindow.document.body;
                      domtoimage
                        .toJpeg(node2, {
                          quality: 0.6
                        })
                        .then(function(dataUrl) {
                          prepareProcessLoadedImages(
                            input.val(),
                            dataUrlOG,
                            dataUrl,
                            $card,
                            "desktop-both"
                          );
                          callback();
                          resolve();
                        });
                    });
                } else {
                  callback();
                  resolve();
                }
              });
          });
      } else if ($card.attr("data-media-query") !== "mobile") {
        ensureCorrectImages("desktop");
        $(".rc-exporter")
          .contents()
          .find("body")
          .css("width", "1440px")
          .css("height", "810px")
          .css("zoom", "1"); //x2\

        var node2 = document.getElementById("rc-exporter").contentWindow
          .document.body;
        domtoimage
          .toJpeg(node2, {
            quality: 0.7
          })
          .then(function(dataUrl) {
            var dataUrlOG = dataUrl;
            $(".rc-exporter")
              .contents()
              .find("body")
              .css("height", "81px")
              .css("width", "144px")
              .css("zoom", "0.1"); //x 0.1

            var node2 = document.getElementById("rc-exporter").contentWindow
              .document.body;
            domtoimage
              .toJpeg(node2, {
                quality: 0.6
              })
              .then(function(dataUrl) {
                prepareProcessLoadedImages(
                  input.val(),
                  dataUrlOG,
                  dataUrl,
                  $card,
                  "desktop"
                );
                callback();
                resolve();
              });
          });
      } else {
        callback();
        resolve();
      }
    } else if (input.val() !== null) {
      // not background blendMode layer so create smaller images for Progressive Load
      var bothWithDifferent = false;
      var thisInputAttr = input.attr("data-input");
      var mobileVal = $card.find("[data-input=background-image]").val();
      var desktopVal = $card
        .find("[data-input-desktop=background-image]")
        .val();

      //Append the images for progressive load
      if (
        desktopVal !== "null" &&
        desktopVal !== null &&
        (mobileVal !== "null" && mobileVal !== null) &&
        $card.find("[data-input-desktop=background-image]").val() !==
          $card.find("[data-input=background-image]").val()
      ) {
        bothWithDifferent = true;
        $(".rc-exporter")
          .contents()
          .find('[data-card="' + $card.attr("data-card-id") + '"]')
          .addClass("both-with-different");

        if (thisInputAttr == "background-image") {
          thisInputAttr = "mobile";
        } else {
          thisInputAttr = "desktop";
        }
        $("body").append(
          '<img id="prepareProcessLoadedImages" sr' +
            'c="' +
            input.val() +
            '" class="prepareProcessLoadedImages"></img>'
        );
        $("body").append(
          '<img id="prepareProcessLoadedImagesdesktop" sr' +
            'c="' +
            $card.find("[data-input-desktop=background-image]").val() +
            '" class="prepareProcessLoadedImages"></img>'
        );
      } else {
        mobileVal = input.val();
        desktopVal = input.val();
        $("body").append(
          '<img id="prepareProcessLoadedImages" sr' +
            'c="' +
            mobileVal +
            '" class="prepareProcessLoadedImages"></img>'
        );
        $("body").append(
          '<img id="prepareProcessLoadedImagesdesktop" sr' +
            'c="' +
            desktopVal +
            '" class="prepareProcessLoadedImages"></img>'
        );
      }

      // Resize the images to Progressive image size
      $("#prepareProcessLoadedImages").width(50);

      // For images for desktop and mobile we need to export two versions.
      if ($card.attr("data-media-query") == "none") {
        var desktopInput = input.val();

        if (
          $card.find("[data-input-desktop=background-image]").val() !==
            "none" &&
          $card.find("[data-input-desktop=background-image]").val !== null
        ) {
          desktopInput = $card
            .find("[data-input-desktop=background-image]")
            .val();
        }
        setTimeout(function() {
          var node = document.getElementById("prepareProcessLoadedImages");
          var desktopnode = document.getElementById(
            "prepareProcessLoadedImagesdesktop"
          );
          // Export the Card image and update array so we can add this code inside the export.

          //IF PNG image, export as png.
          if (
            input
              .val()
              .split("?")[0]
              .substring(input.val().lastIndexOf(".") + 1) == "png"
          ) {
            domtoimage.toPng(node).then(function(dataUrl) {
              //Take screenshot and push to array to modify export code later.
              processLoadedImages.push({
                image: dataUrl,
                identifier: ".x" + $card.attr("data-card-id"),
                ogURL: mobileVal,
                mediaquery: "mobile"
              });
              $("#prepareProcessLoadedImages").remove();
            });
            domtoimage.toPng(desktopnode).then(function(dataUrl) {
              processLoadedImages.push({
                image: dataUrl,
                identifier: ".x" + $card.attr("data-card-id"),
                ogURL: desktopVal,
                mediaquery: "desktop"
              });
              $("#prepareProcessLoadedImagesdesktop").remove();
              callback();
              resolve();
            });
          } else {
            //Other wise export as Jpeg
            domtoimage
              .toJpeg(node, {
                quality: 0.6
              })
              .then(function(dataUrl) {
                processLoadedImages.push({
                  image: dataUrl,
                  identifier: ".x" + $card.attr("data-card-id"),
                  ogURL: mobileVal,
                  mediaquery: "mobile"
                });
                $("#prepareProcessLoadedImages").remove();
              });
            domtoimage
              .toJpeg(desktopnode, {
                quality: 0.6
              })
              .then(function(dataUrl) {
                processLoadedImages.push({
                  image: dataUrl,
                  identifier: ".x" + $card.attr("data-card-id"),
                  ogURL: desktopVal,
                  mediaquery: "desktop"
                });
                $("#prepareProcessLoadedImagesdesktop").remove();
                callback();
                resolve();
              });
          }
        }, 100);
      } else {
        // Other wise export only one image.
        setTimeout(function() {
          var node = document.getElementById("prepareProcessLoadedImages");
          if (
            input
              .val()
              .split("?")[0]
              .substring(input.val().lastIndexOf(".") + 1) == "png"
          ) {
            domtoimage.toPng(node).then(function(dataUrl) {
              processLoadedImages.push({
                image: dataUrl,
                identifier: ".x" + $card.attr("data-card-id"),
                ogURL: input.val(),
                mediaquery: $card.attr("data-media-query")
              });
              $("#prepareProcessLoadedImages").remove();
              callback();
              resolve();
            });
          } else {
            domtoimage
              .toJpeg(node, {
                quality: 0.6
              })
              .then(function(dataUrl) {
                processLoadedImages.push({
                  image: dataUrl,
                  identifier: ".x" + $card.attr("data-card-id"),
                  ogURL: input.val(),
                  mediaquery: $card.attr("data-media-query")
                });
                $("#prepareProcessLoadedImages").remove();
                callback();
                resolve();
              });
          }
        }, 100);
      }
    } else {
      callback();
      resolve();
    }
  } else {
    // Last check, just remove the progressive image because it doesnt need to be re-rendered.
    $cardContainer
      .find(".x" + $card.attr("data-card-id"))
      .removeAttr("v-card-progressive-image");
    callback();
    resolve();
  }
}

var nid = getParameterByName("nid") || "";
var skipCardLength = false;

$(".export-anyway").click(function() {
  skipCardLength = true;
  $(".delete-btn").click();
  $(".export-component").click();
});

//Set up modal action
$(".export-component").click(function() {
  var cards = $(".component-holder .card");

  //check and delete useless layers.
  cards.each(function() {
    var useless = false;
    if ($(this).is('[data-type="layer"]')) {
      var uselessProps = 0;
      //check if layers with opacity 0.
      if (
        $(this)
          .find('[data-input="opacity"]')
          .val() == 0
      ) {
        useless = true;
      }
      // check if layers with no BG color, bg image or border.
      if (
        $(this)
          .find('[data-input="border-width"]')
          .val() == 0
      ) {
        uselessProps += 1;
      }
      if (
        $(this).find('[data-input="background-image"]') == "none" ||
        $(this)
          .find('[data-input="background-image"]')
          .val() == null
      ) {
        uselessProps += 1;
      }
      if (
        $(this).find('[data-input="background-color"]') == "rgb(0, 0, 0)" ||
        $(this)
          .find('[data-input="background-color"]')
          .val() == "hsva(0, 0%, 0%, 0)" ||
        $(this)
          .find('[data-input="background-color"]')
          .val() == "rgba(0, 0, 0, 0)"
      ) {
        uselessProps += 1;
      }
      if (uselessProps == 3) {
        useless = true;
      }
    } else {
      if (
        $(this)
          .find('[data-input="opacity"]')
          .val() == 0
      ) {
        useless = true;
      }
    }
    if (useless === true) {
      $(this)
        .find(".remove-card")
        .click();
    }
  });

  //if too many layers, pop up alert to tidy up the card..
  if (cards.length > 8 && !skipCardLength) {
    var modal = $(".too-much-data-modal");
    var totalOpacityLayers = 0;
    var totalLayers = cards.length;

    modal.find(".layers-currently").html(cards.length);
    modal.find(".invisible-layers").html(totalOpacityLayers);
    modal
      .addClass("is-active")
      .find(".delete-btn")
      .click(function() {
        $(".too-much-data-modal").removeClass("is-active");
        $(".too-much-data-modal .notification .delete").click();
      });
  } else {
    //if not too many layers start export process
    removeAllLayerArray = [];
    processBGArray = [];
    processLoadedImages = [];
    //show-loader
    $(".scmp-loader")
      .css("opacity", "1")
      .fadeIn("0", function() {});
    $("body").addClass("importing");

    //Create places to hold the information
    var $gridHolder = $(".responsive-container")
      .contents()
      .find(".grid");
    $containerClone = $(".responsive-container")
      .contents()
      .find("body")
      .clone();

    //remove layout helpers.
    $containerClone
      .find(
        ".grid, .header, .footer, .ui-resizable-handle, .handle, .video-holder"
      )
      .remove();
    $containerClone.find(".countdown").remove();
    $containerClone.find(".animated").each(function() {
      $(this).removeClass("animated");
      $(this).removeClass($(this).attr("data-animation"));
      $(this).addClass("removing-animated");
    });
    $containerClone
      .find(".ui-resizable")
      .removeClass("ui-resizable")
      .removeAttr("style");
    var $rcContentHelper = $containerClone.clone(); //Fix the border issues..
    $rcContentHelper.find("[data-animation]").css("box-sizing", "border-box");
    var rcHtml = $rcContentHelper.html();

    //Add the proper animation values to layers
    $containerClone.find(".removing-animated").each(function() {
      if ($(this).attr("data-type") == "layer") {
        if (
          $("." + $(this).attr("data-card")).find(
            ".disable-progressive-load:checked"
          ).length > 0
        ) {
          $(this)
            .attr(
              ":class",
              "{'animated " +
                $(this).attr("data-animation") +
                "': showAnimation, 'before" +
                $(this).attr("data-animation") +
                "': !showAnimation, 'before-animation': !showAnimation}"
            )
            .removeClass("removing-animated");
        } else {
          $(this)
            .attr(
              ":class",
              "{'animated " +
                $(this).attr("data-animation") +
                "': showAnimation, 'before" +
                $(this).attr("data-animation") +
                "': !showAnimation, 'before-animation': !showAnimation, 'loaded': isLoaded }"
            )
            .removeClass("removing-animated");
        }
      } else {
        $(this)
          .attr(
            ":class",
            "{'animated " +
              $(this).attr("data-animation") +
              "': showAnimation, 'before" +
              $(this).attr("data-animation") +
              "': !showAnimation, 'before-animation': !showAnimation}"
          )
          .removeClass("removing-animated");
      }
      $(this).attr("ref", "animation-" + $(this).attr("data-card"));
    });

    //Check if prgoressive load is enaled and adjust layer
    $containerClone.find("[data-type=layer]").each(function() {
      if (
        $('[data-card-id="' + $(this).attr("data-card") + '"]').find(
          ".disable-progressive-load:checked"
        ).length > 0
      ) {
      } else {
        if (!$(this).attr(":class")) {
          $(this).attr(":class", "{'loaded': isLoaded}");
        }
      }
    });
    $containerClone.find('[data-type=layer]').attr('v-card-progressive-image', '');
    // Create the mobile height wrapper to ensure text resizes correctly.
    $containerClone
      .find("[data-card]:not(.background-true):not(.opacity-wrapped)")
      .wrapAll('<div class="mobile-height-wrap" ref="mobileHeightWrap">');

    //Since we have to deal with opacity with a wrapper, search this leyer too and add parent to wrap,
    $containerClone
      .find(".opacity-wrapped[data-card]:not(.background-true)")
      .each(function() {
        $(this)
          .parent()
          .appendTo($containerClone.find(".mobile-height-wrap"));
      });

    // Update the card Container with the new content
    $cardContainer = $(
      '<div class="card-container" ref="cardContainer">' +
        $containerClone.html() +
        "</div>"
    );

    // Update the html of exporter
    $(".rc-exporter")
      .contents()
      .find("body")
      .html(rcHtml);

    //process the Images and start the final export process
    $(".scmp-loader .text").text("Preparing Card for export..");
    doSynchronousLoop(
      $(
        "*[data-input=background-image], *[data-input-desktop=background-image]"
      ),
      convertImagesToBase64,
      runImageExport
    );

    // Enable if Video
    if ($(".video-button").hasClass("video-enabled")) {
      $cardContainer.attr("v-video", "");
    }

    // Set up the mobile
    $(".export-modal pre").text($cardContainer.get(0).outerHTML);
    $(".export-modal")
      .addClass("is-active")
      .find(".delete-btn")
      .click(function() {
        $(".export-modal").removeClass("is-active");
        $(".export-modal .notification .delete").click();
      });
  }
});

//If you dont hit yes dont save.
window.onbeforeunload = function(e) {
  return "Please make sure you have exported the card.";
};

//Import card function.
$(".import-dialog").click(function() {
  var jsprompt = prompt("Paste the card code from drupal below", "");
  importContainer(jsprompt, true, true);
  $(".menu-btn").click();
});
