var gifTastic = (function () {
    'use strict'

    // Logic controller
    var controller = {
        // Initialize the app here
        init: function () {
            // Add listener for add category button
            $("#add-topic-button").on("click", controller.onAddCategoryButtonClick);

            // Make an initial call to load the buttons
            controller.loadButtons();
        },

        getMode: function () {
            var mode = $("#fetch-mode input[type=\"radio\"]:checked").data("value");
            return mode;
        },

        // Create and load the GIF buttons
        loadButtons: function () {
            $("#button-wrapper").empty();
            data.topics.forEach(function (category) {
                uiController.addGifButton(category);
            });
        },

        // Click event for the add category button
        onAddCategoryButtonClick: function () {
            //Get the input value
            var val = $("#add-topic-input").val().trim();

            // If there is a value add it to the topics
            if (val) {
                // add the topic to the array
                data.topics.push(val);

                // clear the input
                $("#add-topic-input").val("");

                // reload the buttons.
                controller.loadButtons();
            }
        },

        // Click event for the GIF buttons
        onGifButtonClick: function () {
            // Get our variables and value.
            var $self = $(this);
            var topic = $self.val();
            var mode = controller.getMode();

            var queryURL;
            if (mode === "search") {
                // For search mode keep track of offse so subsequent clicks don't get the same 10 every time.
                var offset = parseInt($self.data("searchOffset"));
                var offsetParameter = "&limit=10&offset=" + offset;

                // Construct the query url.
                queryURL = data.apiSearchUrl + topic + offsetParameter;

                // update the offset on the button
                offset++;
                $self.data("searchOffset", offset);
            } else {
                // Construct the query url.
                queryURL = data.apiRandomUrl + topic;
            }

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                // If the data object has a property of title it came from the "random" query and should be passed as
                // a single object. Otherwise it is from the "search" query and should be looped through to pass 
                // individual elements.
                if (response.data.hasOwnProperty("title")) {
                    uiController.addGif(response.data);
                } else {
                    response.data.forEach(function (gifData) {
                        uiController.addGif(gifData);
                    })
                }
            });
        },

        onGifImageClick: function () {
            // Get the data state for this image
            var $self = $(this);
            var data = $self.data();

            // If state is equal to 'still', then update the src attribute of this
            // image to it's data-animated value and update the data-state attribute to 'animated'
            // otherwise update the src attribute of this image to it's data-still value and 
            // update the data-state attribute to 'still'
            if (data.state === "still") {
                $self.attr("src", data.animated);
                data.state = "animated";
            } else {
                $self.attr("src", data.still);
                data.state = "still";
            }

            // Write the data back to the image
            $(this).data(data);
        }
    }

    // Application UI controller
    var uiController = {
        // Add a button to load a category of GIFs
        addGifButton: function (value) {
            $("<button>").attr({
                "type": "button",
                "class": "btn btn-info mx-1 mb-1",
                "data-search-offset": "0",
                "value": value
            })
                .text(value)
                .on("click", controller.onGifButtonClick)
                .appendTo("#button-wrapper");
        },

        // add the image to the page
        addGif: function (gifData) {
            // create a column for the card
            var column = $("<div>")
                .addClass("col-6 col-lg-3")
                .prependTo("#gif-wrapper");

            //create the card.
            var imageCard = $("<div>")
                .addClass("card image bg-dark text-white")
                .appendTo(column);

            var image = $("<img>")
                .attr({
                    "data-state": "still",
                    "data-animated": gifData.images.fixed_width.url,
                    "data-still": gifData.images.fixed_width_still.url,
                    "src": gifData.images.fixed_width_still.url,
                    "alt": gifData.title
                })
                .on("click", controller.onGifImageClick)
                .appendTo(imageCard);
        }
    }

    // Application Data
    var data = {
        apiRandomUrl: "https://api.giphy.com/v1/gifs/random?api_key=Cae2ZgJcuBooeP23kAYxa4zRtfVu6MOu&rating=PG-13&tag=",
        apiSearchUrl: "https://api.giphy.com/v1/gifs/search?api_key=Cae2ZgJcuBooeP23kAYxa4zRtfVu6MOu&rating=PG-13&lang=en&q=",
        topics: ["Sci-Fi/Fantasy", "Marvel Comics", "DC Comics", "Cats", "Dogs", "Dancing", "Squeee", "Nope", "Yep"]
    }

    $(document).ready(controller.init);
})();