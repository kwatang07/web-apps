//http://demo.nithinbekal.com/html5todo/v1/#

$(function(){

	 var i = 0;
      
      // Initial loading of tasks
      for( i = 0; i < localStorage.length; i++)
        $(".search-history").append("<li id='hist-"+ i +"'>" + localStorage.getItem('hist-'+i) + " <a href='#'>x</a></li>");


	String.prototype.linkify = function() {
		return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/, function(m) {
			return m.link(m);
		});
	};

	function relative_time(time_value) {
		var values = time_value.split(" ");
		// time_value = values[2] + " " + values[1] + ", " + values[3] + " " + values[5];
		var parsed_date = Date.parse(time_value);
		var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
		var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
		delta = delta + (relative_to.getTimezoneOffset() * 60);

		var r = '';
		if (delta < 60) {
			r = 'a minute ago';
		} else if(delta < 120) {
			r = 'couple of minutes ago';
		} else if(delta < (45*60)) {
			r = (parseInt(delta / 60)).toString() + ' minutes ago';
		} else if(delta < (90*60)) {
			r = 'an hour ago';
		} else if(delta < (24*60*60)) {
			r = '' + (parseInt(delta / 3600)).toString() + ' hours ago';
		} else if(delta < (48*60*60)) {
			r = '1 day ago';
		} else {
			r = (parseInt(delta / 86400)).toString() + ' days ago';
		}

		return r;
	}


	var TweetModel = Backbone.Model.extend({
		initialize: function() {
			var txt = this.get('text');
			this.set('text', txt.linkify());
			this.set('relative_time', relative_time(this.get('created_at')));
		}
	});

	var TweetCollection = Backbone.Collection.extend({
        model: TweetModel,
        initialize: function() {

        },
        url: function() {
			return 'http://search.twitter.com/search.json?q=' + this.query +  '&page=' + this.page + '&rpp=1000&callback=?';
        },
        query: '', //default query
        page: '1',
        parse: function(resp, xhr) {
			return resp.results;
        }

    });

	var TweetController = Backbone.View.extend({
		tagName: 'li',
		events: {
			"click .tweet-reply": "onReply",
			"click .tweet-retweet": "onRetweet",
			"click .tweet-favorite": "onFavorite"
		},
		initialize: function() {
			this.render();
		},
		render: function() {
			this.template = _.template($('#tweet-view-new').html());
            var dict = this.model.toJSON();
            var markup = this.template(dict);
            $(this.el).html(markup);
            return this;
		},
		onReply: function() {
			var url = "https://twitter.com/intent/tweet?in_reply_to=" + this.model.get('id');
			window.open(url, "_newtab");
		},
		onRetweet: function() {
			var url = "https://twitter.com/intent/retweet?tweet_id=" + this.model.get('id');
			window.open(url, "_newtab");
		},
		onFavorite: function() {
			var url = "https://twitter.com/intent/favorite?tweet_id=" + this.model.get('id');
			window.open(url, "_newtab");
		}

	});

	var AppController = Backbone.View.extend({
		events: {
			'submit .tweet-search': 'onSearch',
			'click .search-history li': 'onSearch2',
			'click .search-history li a' : 'removethis',
		},
		initialize: function () {
			this._tweetsView = [];
			this.tweets = new TweetCollection();

			//set event handlers
			_.bindAll(this, 'onTweetAdd');
			this.tweets.bind('add', this.onTweetAdd);
		},

		loadTweets: function () {
			var that = this;
			
			this.tweets.fetch({
				add: that.onTweetAdd,
				success: function() {
					$('.title').html('<span class="blue">' + that.tweets.length + '</span> results for: "' + that.tweets.query +'"');
				}
			});
		},

		onSearch: function(e) {
		
			this.tweets.query = this.$('.search-query').val();
			var itemExists = false;
			var valueof = $('.search-query').val();
			if (  $(".search-query").val() != "" ) {
			e.preventDefault();
			this.tweets.reset();
			this.$('.tweets-result li').remove();
			this.loadTweets();
			
        
           $(".search-history li").each(function() {
                if ($(this).text() == $.trim(valueof)) {
                    itemExists = true;
                }
            });
           
			if (!itemExists) { 
				localStorage.setItem( "hist-"+i, valueof );
				this.$(".search-history").append("<li id='valueof'>"+localStorage.getItem("hist-"+i)+"<a href='#' class='closebutton' id='hist-"+i+"'>x</a></li>")
				 $("#hist-" + i).css('display', 'none');
				 $("#hist-" + i).slideDown();
				$(".search-query").val("");
				i++;
			};
			}
			;
		return false;
		},
		
		onSearch2: function(e) {
			var clickedtext = $(e.target).text();
			var cts = clickedtext.substring(0, clickedtext.length -1);
			this.tweets.query = cts;
			this.tweets.reset();
			this.$('.tweets-result li').remove();
			this.loadTweets();
			return false;
		},
		
		removethis: function(e) {
		localStorage.removeItem($(e.target).parent().attr("id"));
        $(e.target).parent().remove();
        for(i=0; i<localStorage.length; i++) {
          if( !localStorage.getItem("hist-"+i)) {
            localStorage.setItem("hist-"+i, localStorage.getItem('hist-' + (i+1) ) );
            localStorage.removeItem('hist-'+ (i+1) );
          }
        };
		return false;
		},

		onTweetAdd: function(model) {
			console.log('tweet added', model.get('text'));
			var tweetController = new TweetController({
				model: model
			});

			//display tweet item
			this._tweetsView.push(tweetController);
			this.$('.tweets-result').append(tweetController.render().el);
			
		}

	});

	window.app = new AppController({
		el: $('body')
	});

});