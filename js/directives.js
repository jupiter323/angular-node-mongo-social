angular.module('er.directives', [])
.directive('ngScrollbar', ['$parse', '$window', '$rootScope',
	function ($parse, $window, $rootScope) {
		return {
			restrict: 'A',
			replace: true,
			transclude: true,
			scope: { 'showYScrollbar': '=?isBarShown' },
			link: function (scope, element, attrs) {
				var mainElm, transculdedContainer, tools, thumb, thumbLine, track;
				var flags = { bottom: attrs.hasOwnProperty('bottom') };
				var win = angular.element($window);
				var hasAddEventListener = !!win[0].addEventListener;
				var hasRemoveEventListener = !!win[0].removeEventListener;
				// Elements
				var dragger = { top: 0 }, page = { top: 0 };
				// Styles
				var scrollboxStyle, draggerStyle, draggerLineStyle, pageStyle;
				var calcStyles = function () {
					scrollboxStyle = {
						position: 'relative',
						overflow: 'hidden',
						'max-width': '100%',
						height: '100%'
					};
					if (page.height) {
						scrollboxStyle.height = page.height + 'px';
					}
					draggerStyle = {
						position: 'absolute',
						height: dragger.height + 'px',
						top: dragger.top + 'px'
					};
					draggerLineStyle = {
						position: 'relative',
						'line-height': dragger.height + 'px'
					};
					pageStyle = {
						position: 'relative',
						top: page.top + 'px',
						overflow: 'hidden'
					};
				};
				var redraw = function () {
					thumb.css('top', dragger.top + 'px');
					var draggerOffset = dragger.top / page.height;
					page.top = -Math.round(page.scrollHeight * draggerOffset);
					transculdedContainer.css('top', page.top + 'px');
					$rootScope.$broadcast('scrollbar-redraw', element, page.top)
				};
				var trackClick = function (event) {
					var offsetY = event.hasOwnProperty('offsetY') ? event.offsetY : event.layerY;
					var newTop = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
					dragger.top = newTop;
					redraw();
					event.stopPropagation();
				};
				var wheelHandler = function (event) {
					var wheelSpeed = 60;
					// Mousewheel speed normalization approach adopted from
					// http://stackoverflow.com/a/13650579/1427418
					var o = event, d = o.detail, w = o.wheelDelta, n = 225, n1 = n - 1;
					// Normalize delta
					d = d ? w && (f = w / d) ? d / f : -d / 1.35 : w / 120;
					// Quadratic scale if |d| > 1
					d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;
					// Delta *should* not be greater than 2...
					event.delta = Math.min(Math.max(d / 2, -1), 1);
					event.delta = event.delta * wheelSpeed;
					dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10) - (event.delta / page.height * dragger.height)));
					redraw();
					if (!!event.preventDefault) {
						event.preventDefault();
					} else {
						return false;
					}
				};
				var lastOffsetY = 0;
				var thumbDrag = function (event, offsetX, offsetY) {
					dragger.top = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
					event.stopPropagation();
				};
				var dragHandler = function (event) {
					var newOffsetX = 0;
					var newOffsetY = event.pageY - thumb[0].scrollTop - lastOffsetY;
					thumbDrag(event, newOffsetX, newOffsetY);
					redraw();
				};
				var _mouseUp = function (event) {
					win.off('mousemove', dragHandler);
					win.off('mouseup', _mouseUp);
					event.stopPropagation();
				};
				var _touchDragHandler = function (event) {
					var newOffsetX = 0;
					var newOffsetY = event.originalEvent.changedTouches[0].pageY - thumb[0].scrollTop - lastOffsetY;
					thumbDrag(event, newOffsetX, newOffsetY);
					redraw();
				};
				var _touchEnd = function (event) {
					win.off('touchmove', _touchDragHandler);
					win.off('touchend', _touchEnd);
					event.stopPropagation();
				};
				var registerEvent = function (elm) {
					var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
					if (hasAddEventListener) {
						elm.addEventListener(wheelEvent, wheelHandler, false);
					} else {
						elm.attachEvent('onmousewheel', wheelHandler);
					}
				};
				var removeEvent = function (elm) {
					var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
					if (hasRemoveEventListener) {
						elm.removeEventListener(wheelEvent, wheelHandler, false);
					} else {
						elm.detachEvent('onmousewheel', wheelHandler);
					}
				};
				var buildScrollbar = function (rollToBottom) {
					rollToBottom = flags.bottom || rollToBottom;
					mainElm = angular.element(element.children()[0]);
					transculdedContainer = angular.element(mainElm.children()[0]);
					tools = angular.element(mainElm.children()[1]);
					thumb = angular.element(angular.element(tools.children()[0]).children()[0]);
					thumbLine = angular.element(thumb.children()[0]);
					track = angular.element(angular.element(tools.children()[0]).children()[1]);
					page.height = element[0].offsetHeight;
					page.scrollHeight = transculdedContainer[0].scrollHeight;
					if (page.height < page.scrollHeight) {
						scope.showYScrollbar = true;
						scope.$emit('scrollbar.show');
						// Calculate the dragger height
						dragger.height = Math.round(page.height / page.scrollHeight * page.height);
						dragger.trackHeight = page.height;
						// update the transcluded content style and clear the parent's
						calcStyles();
						element.css({ overflow: 'hidden' });
						mainElm.css(scrollboxStyle);
						transculdedContainer.css(pageStyle);
						thumb.css(draggerStyle);
						thumbLine.css(draggerLineStyle);
						// Bind scroll bar events
						track.bind('click', trackClick);
						// Handle mousewheel
						registerEvent(transculdedContainer[0]);
						// Drag the scroller with the mouse
						thumb.on('mousedown', function (event) {
							lastOffsetY = event.pageY - thumb[0].offsetTop;
							win.on('mouseup', _mouseUp);
							win.on('mousemove', dragHandler);
							event.preventDefault();
						});
						// Drag the scroller by touch
						thumb.on('touchstart', function (event) {
							lastOffsetY = event.originalEvent.changedTouches[0].pageY - thumb[0].offsetTop;
							win.on('touchend', _touchEnd);
							win.on('touchmove', _touchDragHandler);
							event.preventDefault();
						});
						if (rollToBottom) {
							flags.bottom = false;
							dragger.top = parseInt(page.height, 10) - parseInt(dragger.height, 10);
						} else {
							dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10)));
						}
						redraw();
					} else {
						scope.showYScrollbar = false;
						scope.$emit('scrollbar.hide');
						thumb.off('mousedown');
						removeEvent(transculdedContainer[0]);
						transculdedContainer.attr('style', 'position:relative;top:0');
						// little hack to remove other inline styles
						mainElm.css({ height: '100%' });
					}
				};
				var rebuildTimer;
				var rebuild = function (e, data) {
					/* jshint -W116 */
					if (rebuildTimer != null) {
						clearTimeout(rebuildTimer);
					}
					/* jshint +W116 */
					var rollToBottom = !!data && !!data.rollToBottom;
					rebuildTimer = setTimeout(function () {
						page.height = null;
						buildScrollbar(rollToBottom);
						if (!scope.$$phase) {
							scope.$digest();
						}
						// update parent for flag update
						if (!scope.$parent.$$phase) {
							scope.$parent.$digest();
						}
					}, 72);
				};
				buildScrollbar();
				if (!!attrs.rebuildOn) {
					attrs.rebuildOn.split(' ').forEach(function (eventName) {
						scope.$on(eventName, rebuild);
					});

					attrs.rebuildBottomOn.split(' ').forEach(function (eventName) {
						scope.$on(eventName, function (e) {
							rebuild(e, {rollToBottom: true})
						})
					});
				}
				if (attrs.hasOwnProperty('rebuildOnResize')) {
					win.on('resize', rebuild);
				}
			},
			template: '<div>' + '<div class="ngsb-wrap">' + '<div class="ngsb-container" ng-transclude></div>' + '<div class="ngsb-scrollbar" style="position: absolute; display: block;" ng-show="showYScrollbar">' + '<div class="ngsb-thumb-container">' + '<div class="ngsb-thumb-pos" oncontextmenu="return false;">' + '<div class="ngsb-thumb" ></div>' + '</div>' + '<div class="ngsb-track"></div>' + '</div>' + '</div>' + '</div>' + '</div>'
		};
	}
])
.directive('dropdown', function ($timeout) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/dropdown.htm',
		scope: {
			title: '@',
			defaultItem: '=',
			list: '=',
			selected: '=',
			change: '=',
		},
		link: function ($scope, element, attr) {
			var rootElement = angular.element(element)[0]

			var dropdownButton = angular.element(rootElement.querySelector('.dropdown')),
				dropdownList = angular.element(rootElement.querySelector('.dropdown-list'))
				dropdownLists = angular.element(document.querySelectorAll('.dropdown-list'))

			angular.element(document.body).on('click', function (e) {
				dropdownList.removeClass('active')
			})

			dropdownList.on('click', function (e) {e.stopImmediatePropagation()})
			dropdownList.on('mouseleave', function (e) {
				dropdownLists.removeClass('active')
			})

			dropdownButton.on('click', function (e) {
				e.stopImmediatePropagation()

				$timeout(function () {
					document.body.click()

					// dropdownLists.removeClass('active')
					dropdownList.toggleClass('active')
				}, 10)
			})

			$scope.isActiveParentItem = function (parentItem) {
				for (var i in parentItem.sub) {
					if (parentItem.sub[i].id === $scope.selected.id) return true
				}
			}

			$scope.isActiveItem = function (item) {
				return $scope.selected.id == item.id
			}

			$scope.choose = function (item) {
				$scope.change(item)
				dropdownList.removeClass('active')
			}
		}
	}
})
.directive('usermenu', function ($auth, $rootScope, $cookies, $location, $timeout, identityService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/usermenu.htm',
		scope: {user: '='},
		link: function ($scope, element, attr) {
			$scope.logout = function () {
				$cookies.remove('user')
				$cookies.remove('token')
				$auth.logout()
				identityService.clean()
				$location.url('/start')
				window.location.reload()
			}

			$scope.$on('open-user-menu', function (e, data) {
				$timeout(function () {
					document.body.click()
					$scope.active = true
				}, 10)
			})

			angular.element(document.body).on('click shadow-click', function () {
				$scope.active = false
				$scope.$apply()
			})
		}
	}
})
.directive('avatar', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/avatar.htm',
		scope: {
			user: '=',
			nolink: '=',
		},
		link: function ($scope, element, attr) {
			$scope.nl = $scope.nolink || false

			$scope.user.role = $scope.user.role[0].toUpperCase() + $scope.user.role.substr(1)

			if (!$scope.user) {
				return angular.element(element).css('backgroundColor', 'red')
			}

			$scope.number = $scope.user.xpInfo.level || 1
			$scope.color = $scope.user.color || 'bronze'
			$scope.image = $scope.user.avatar || '/assets/images/avatar_placeholder.png'
			$scope.role = $scope.user.role || 'User'

			if ($scope.role == 'User') {
				$scope.nl = true
			}
		}
	}
})
.directive('onyourmind', function ($rootScope, $timeout, postService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/onyourmind.htm',
		link: function ($scope, element, attr) {
			$scope.files = []

			// $scope.user = $scope.$parent.user
			$scope.create = function () {
				if ($scope.loading) return
				$scope.loading = true

				var fileObjects = $scope.files.map(function (file) {
					return file.fileObject
				})

				var progress = function () {}

				postService.create($scope.text, fileObjects, progress).then(function (result) {
					$scope.$parent.$apply(function () {
						$scope.text = ''
						$scope.files = []
						$rootScope.$emit('reloadfeed')
						$rootScope.$emit('updateCategoriesFilter')

						$scope.loading = false
					})
				}).catch(function (error) {
					console.error(error)
					$scope.loading = false
				})
			}

			$scope.addImage = function () {
				if ($scope.loading) return

				var fileFileInput = element[0].querySelector('input[type=file]')
				angular.element(fileFileInput).on('change', function (e) {
					e.stopImmediatePropagation()

					var reader = new FileReader()
					var file = e.target.files[0]

					if (['image/jpeg', 'image/png'].indexOf(file.type) === -1) {
						return
					}

					reader.addEventListener('load', function () {
						$scope.$apply(function () {
							$scope.files.push({
								base64: reader.result,
								fileObject: file
							})

							// Reset form to clean file input. This will
							// let us upload the same file
							angular.element(e.target).parent()[0].reset()
						})
					})

					reader.readAsDataURL(file)
				})

				$timeout(function () {
					fileFileInput.click()
					$timeout.cancel(this)
				}, 0)
			}

			$scope.removeUpload = function (index) {
				if ($scope.loading) return

				$scope.files = $scope.files.filter(function (file, fileIndex) {
					if (index == fileIndex) return false
					return true
				})
			}

			angular.element(element[0].querySelector('textarea')).on('keyup keypress', function (e) {
				var text = e.target.value,
					linesCount = text.split(/\n/).length

				var paddingTop = parseInt(window.getComputedStyle(e.target).paddingTop),
					paddingBottom = parseInt(window.getComputedStyle(e.target).paddingBottom)

				if (linesCount > 3) {
					angular.element(e.target).css('height', (((linesCount + 1) * 16) + (paddingTop + paddingBottom + 2)) + 'px')
				} else {
					angular.element(e.target).css('height', '')
				}
			})
		}
	}
})
.directive('profilereactions', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/profilereactions.htm',
		scope: {
			active: '=',
			profile: '='
		},
		link: function ($scope, element, attr) {

		},
	}
})
.directive('aboutbox', function () {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/aboutbox.htm',
	}
})
.directive('searchfeed', function ($rootScope, identityService, feedService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/feed.htm',
		scope: {
			type: '=',
			id: '=',
			user: '=',
			q: '=',
		},
		link: function ($scope, element, attr) {
			var start = 0,
				originalLimit = limit = 3

			angular.element(window).on('scroll', function (e) {
				if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 30 && !$scope.feedLoading) {
					init({addmore: true})
				}
			})

			$rootScope.$on('updateFeedVisibleCount', function (event) {
				updateVisibleCount($scope.feed)
			})

			$rootScope.$on('feedFilter', function (event, filter) {
				$scope.filter = filter

				init()
			})

			var updateVisibleCount = function (feed) {
				var count = 0

				for (var i in feed) {
					var article = feed[i]

					if (/*!article.hidden && */!article.muted && !article.blocked) {
						count++
					}
				}

				$scope.visibleCount = count
			}

			var init = function (options) {
				if (!options) {
					options = {
						addmore: false,
					}
				}

				if (!$scope.user) {
					feedType = 'all'
				}

				$scope.feedLoading = true

				if (start == 0 || !options.addmore) {
					$scope.feed = []
					start = 0
				}

				var setFeed = function (feed) {
					$scope.feedLoading = false

					if (start > 0 || options.addmore) {
						for (var i in feed) {
							$scope.feed.push(feed[i])
						}
					} else {
						$scope.feed = feed
					}

					start += feed.length
				}

				feedService.search({
					q: $scope.q,
					start: start,
					limit: limit,
					filter: $scope.filter,
				}).then(function (feed) {
					setFeed(feed)
					updateVisibleCount($scope.feed)
				})
			}

			init()			
		},
	}
})
.directive('feed', function ($rootScope, identityService, feedService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/feed.htm',
		scope: {
			type: '=',
			id: '=',
			user: '=',
		},
		link: function ($scope, element, attr) {
			var start = 0,
				originalLimit = limit = 5

			$scope.lastCategory
			$scope.lastCountry
			$scope.filter

			$rootScope.$on('reloadfeed', function () {
				init()
			})

			angular.element(window).on('scroll', function (e) {
				if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 30 && !$scope.feedLoading) {
					init({addmore: true})
				}
			})

			$rootScope.$on('feedCategory', function (event, category) {
				if (category.id === 0) {
					$scope.lastCategory = undefined
				} else {
					$scope.lastCategory = category.tag
				}

				init()
			})

			$rootScope.$on('feedCountry', function (event, country) {
				if (country.id === 0) {
					$scope.lastCountry = undefined
				} else {
					$scope.lastCountry = country.title
				}

				init()
			})

			$rootScope.$on('feedFilter', function (event, filter) {
				$scope.filter = filter

				init()
			})

			identityService.mutedAuthors().then(function (authors) {
				$scope.mutedAuthors = authors
			})

			var feedType = 'all'

			$rootScope.$on('updateFeedVisibleCount', function (event) {
				updateVisibleCount($scope.feed)
			})

			var updateVisibleCount = function (feed) {
				var count = 0

				for (var i in feed) {
					var article = feed[i]

					if (/*!article.hidden && */!article.muted && !article.blocked) {
						count++
					}
				}

				$scope.visibleCount = count
			}

			var init = function (options) {
				if (!options) {
					options = {
						addmore: false,
					}
				}

				if (!$scope.user) {
					feedType = 'all'
				}

				$scope.feedLoading = true

				if (start == 0 || !options.addmore) {
					$scope.feed = []
					start = 0
				}

				var setFeed = function (feed) {
					$scope.feedLoading = false

					if (start > 0 || options.addmore) {
						for (var i in feed) {
							$scope.feed.push(feed[i])
						}
					} else {
						$scope.feed = feed
					}

					start += feed.length
				}

				if ($scope.type == 'own') {
					feedService.byUser($scope.id, start, limit).then(function (feed) {
						setFeed(feed)
						updateVisibleCount($scope.feed)
					})
				} else if ($scope.type && $scope.type != 'own') {
					feedService.reacted($scope.id, $scope.type, start, limit).then(function (feed) {
						setFeed(feed)
						updateVisibleCount($scope.feed)
					})
				} else {
					var feedAttributes = {category: $scope.lastCategory, country: $scope.lastCountry, filter: $scope.filter}
					if ($scope.user) feedAttributes['user'] = $scope.user._id
					feedAttributes['start'] = start
					feedAttributes['limit'] = limit

					feedService[feedType].call(feedService, feedAttributes).then(function (feed) {
						// $scope.feedLoading = false
						// $scope.feed = feed

						if (feed.length == 0 && feedType != 'all' && start == 0) {
							feedType = 'all'
							return init()
						}

						setFeed(feed)
						updateVisibleCount($scope.feed)
					})
				}
			}

			init()
		}
	}
})
.directive('post', function ($rootScope, $timeout, identityService, postService, commentService, reactionsService, followService, reportModal) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/post.htm',
		scope: {
			post: '=',
			user: '=',
			// When "justone" is true we don't need to collapse comments or enable link to separate post
			justone: '=',
		},
		link: function ($scope, element, attr) {
			$scope.expandVisible = false

			$timeout(function () {
				if ($scope.justone) return

				var $content = element.find('.content')[0]
				if ($content.scrollHeight - 10 > $content.clientHeight) {
					$scope.expandVisible = true
					$scope.$apply()
				}
			})

			angular.element(document.body).on('click', function () {
				$scope.post.menu = false
			})

			followService.isFollowing($scope.post.author._id).then(function (result) {
				$scope.post.author.isFollowing = result
			})

			$scope.follow = function (post) {
				followService.follow(post.author._id).then(function (result) {
					$scope.post.author.isFollowing = result
				})
			}

			$scope.unfollow = function (post) {
				followService.unfollow(post.author._id).then(function (result) {
					$scope.post.author.isFollowing = result
				})
			}

			$scope.hide = function (post) {
				postService.hide(post._id).then(function (result) {
					$scope.post.hidden = true
					$rootScope.$emit('updateFeedVisibleCount')
				})
			}

			$scope.unhide = function (post) {
				postService.unhide(post._id).then(function (result) {
					$scope.post.hidden = false
					$rootScope.$emit('updateFeedVisibleCount')
				})
			}

			$rootScope.$on('muteauthor', function (event, authorId) {
				if ($scope.post.author._id == authorId) {
					$scope.post.muted = true
					$rootScope.$emit('updateFeedVisibleCount')
				}
			})

			$scope.mute = function (author) {
				postService.mute(author._id).then(function (result) {
					$rootScope.$emit('muteauthor', author._id)
				})
			}

			$scope.block = function (author) {
				identityService.block(author._id).then(function (result) {
					$scope.post.blocked = true
					$rootScope.$emit('updateFeedVisibleCount')
				})
			}

			$scope.report = function (post) {
				identityService.report(post._id).then(function (result) {
					reportModal.activate({$parent: $scope})
				})
			}

			$scope.files = []

			$scope.addComment = function (post) {
				if ($scope.loading) return
				$scope.loading = true

				var fileObjects = $scope.files.map(function (file) {
					return file.fileObject
				})

				var progress = function () {
					
				}

				var commentObject = {
					_id: '',
					author: $scope.user,
					createdAt: (new Date()),
					dislikes: 0,
					likes: 0,
					post: post._id,
					text: post.commentText,
					images: $scope.files.map(function (f) {
						return f.base64
					})
				}

				if (!post.comments) {
					post.comments = []
				}

				post.comments.push(commentObject)

				commentService.add(post._id, post.commentText, fileObjects).then(function () {
					$rootScope.$emit('reloadcomments', post._id)
					$scope.loading = false
				}, function () {
					$scope.loading = false
				})

				post.commentText = ''
				$scope.files = []
			}

			$scope.addImage = function () {
				if ($scope.loading) return

				var fileFileInput = element[0].querySelector('input[type=file]')
				angular.element(fileFileInput).on('change', function (e) {
					e.stopImmediatePropagation()

					var reader = new FileReader()
					var file = e.target.files[0]

					if (['image/jpeg', 'image/png'].indexOf(file.type) === -1) {
						return
					}

					reader.addEventListener('load', function () {
						$scope.$apply(function () {
							$scope.files.push({
								base64: reader.result,
								fileObject: file
							})

							// Reset form to clean file input. This will
							// let us upload the same file
							angular.element(e.target).parent()[0].reset()
						})
					})

					reader.readAsDataURL(file)
				})

				$timeout(function () {
					fileFileInput.click()
					$timeout.cancel(this)
				}, 0)
			}

			$scope.react = function (post, type, unreact) {
				var action = 'react'
				if (unreact) action = 'unreact'

				$scope.post.youdid[type] = (action == 'react')
				if (type == 'like' && $scope.post.youdid.dislike) {
					$scope.post.youdid.dislike = false
				} else if (type == 'dislike' && $scope.post.youdid.like) {
					$scope.post.youdid.like = false
				}

				reactionsService[action](post._id, type).then(function (result) {
					$rootScope.$emit('reloadreactions', post._id)
				}, function (error) {
					console.error('Reaction failed')
					console.error(error)
				})
			}

			$scope.removePost = function (post) {
				postService.remove(post._id).then(function () {
					$rootScope.$emit('reloadfeed')
				}, function () {
					alert('Unable to remove post. Please, try again later.')
				})
			}
		}
	}
})
.directive('postreactions', function ($rootScope, reactionsService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/postreactions.htm',
		scope: {
			post: '='
		},
		link: function ($scope, element, attr) {
			$scope.reactions = {
				expert: {
					likes: 0,
					dislikes: 0,
					shares: 0,
				},
				journalist: {
					likes: 0,
					dislikes: 0,
					shares: 0,
				},
				user: {
					likes: 0,
					dislikes: 0,
					shares: 0,
				},
			}

			var init = function () {
				reactionsService.get($scope.post._id).then(function (reactionInfo) {
					$scope.post.youdid = reactionInfo.youdid

					var reactions = reactionInfo.reactions

					reactions.expert.likes = numeral(reactions.expert.likes).format('0a').toUpperCase()
					reactions.expert.dislikes = numeral(reactions.expert.dislikes).format('0a').toUpperCase()
					reactions.expert.shares = numeral(reactions.expert.shares).format('0a').toUpperCase()
					reactions.journalist.likes = numeral(reactions.journalist.likes).format('0a').toUpperCase()
					reactions.journalist.dislikes = numeral(reactions.journalist.dislikes).format('0a').toUpperCase()
					reactions.journalist.shares = numeral(reactions.journalist.shares).format('0a').toUpperCase()
					reactions.user.likes = numeral(reactions.user.likes).format('0a').toUpperCase()
					reactions.user.dislikes = numeral(reactions.user.dislikes).format('0a').toUpperCase()
					reactions.user.shares = numeral(reactions.user.shares).format('0a').toUpperCase()

					$scope.reactions = reactions
					$scope.$apply()
				}, function (error) {
					console.error(error)
				})
			}

			init()

			$rootScope.$on('reloadreactions', function (event, postId) {
				if (postId != $scope.post._id) return
				init()
			})
		},
	}
})
.directive('postcomments', function ($rootScope, postService, commentService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/postcomments.htm',
		scope: {
			post: '=',
			nocollapse: '=',
			user: '=',
		},
		link: function ($scope, element, attr) {
			$scope.showmore = false

			$scope.comments = []

			$rootScope.$on('reloadcomments', function (e, args) {
				init()
			})

			$scope.remove = function (comment) {
				commentService.remove(comment._id).then(function (result) {
					console.log(result)
					console.log(result.ok)
					console.log(result.n)

					if (result.ok == 1 && result.n == 1) {
						comment.removed = true
					}
				})
			}

			var init = function () {
				postService.getComments($scope.post._id).then(function (comments) {
					$scope.comments = comments
					$scope.$parent.commentsCount = $scope.comments.length
					$scope.post.comments = comments
					$scope.$apply()
					
					$rootScope.$emit('commentsloaded', $scope.post._id)
				})
			}

			init()
		}
	}
})
.directive('commentreactions', function ($rootScope, commentReactionsService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/commentreactions.htm',
		scope: {
			comment: '='
		},
		link: function ($scope, element, attr) {
			var init = function () {
				commentReactionsService.get($scope.comment._id).then(function (reactionInfo) {
					$scope.comment.youdid = reactionInfo.youdid

					var reactions = reactionInfo.reactions

					// reactions.likes = numeral(reactions.likes).format('0a').toUpperCase()
					// reactions.dislikes = numeral(reactions.dislikes).format('0a').toUpperCase()

					$scope.reactions = reactions
					$scope.$apply()
				}, function (error) {
					console.error(error)
				})
			}

			init()

			$rootScope.$on('reloadcommentreactions', function (event, commentId) {
				if (commentId != $scope.comment._id) return
				init()
			})

			$scope.react = function (comment, type, unreact) {
				var action = 'react'
				if (unreact) action = 'unreact'

				$scope.comment.youdid[type] = (action == 'react')
				console.log($scope.reactions[type + 's'])
				$scope.reactions[type + 's'] += (action == 'react') ? 1 : -1
				console.log($scope.reactions[type + 's'])

				if (type == 'like' && $scope.comment.youdid.dislike) {
					$scope.comment.youdid.dislike = false
					$scope.reactions.dislikes--
				} else if (type == 'dislike' && $scope.comment.youdid.like) {
					$scope.comment.youdid.like = false
					$scope.reactions.likes--
				}

				commentReactionsService[action](comment._id, type).then(function (result) {
					$rootScope.$emit('reloadcommentreactions', comment._id)
				}, function (error) {
					console.log('Reaction failed')
					console.log(error)
				})
			}
		},
	}
})
.directive('person', function ($rootScope, followService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/person.htm',
		scope: {
			person: '=',
		},
		link: function ($scope, element, attr) {
			if ($scope.person.intro && $scope.person.intro.length > 110) {
				$scope.person.intro = $scope.person.intro.substr(0, 110) + '...'
			}

			angular.element(document.body).on('click', function () {
				$scope.person.menu = false
				$scope.$apply()
			})

			$scope.person.role = $scope.person.role[0].toUpperCase() + $scope.person.role.substr(1)

			// if (typeof $scope.person.isFollowing === 'undefined') {
				followService.isFollowing($scope.person._id).then(function (result) {
					$scope.person.isFollowing = result
				})
			// }

			$scope.toggleFollow = function (person) {
				if (person.isFollowing) {
					followService.unfollow(person._id).then(function (result) {
						$scope.person.isFollowing = result
						$rootScope.$emit('update-follow')
					})
				} else {
					followService.follow(person._id).then(function (result) {
						$scope.person.isFollowing = result
						$rootScope.$emit('update-follow')
					})
				}
			}
		}
	}
})
.directive('question', function (followService, questionsService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/question.htm',
		scope: {
			question: '='
		},
		link: function ($scope, element, attr) {
			
		}
	}
})
.directive('familiarexpert', function ($rootScope, followService, postService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/familiar-expert.htm',
		scope: {
			person: '=',
			user: '='
		},
		link: function ($scope, element, attr) {
			$scope.person.role = $scope.person.role[0].toUpperCase() + $scope.person.role.substr(1)

			followService.isFollowing($scope.person._id).then(function (result) {
				$scope.person.isFollowing = result
			})

			$scope.mute = function (person) {
				postService.mute(person._id)
				delete $scope.person
			}

			$scope.follow = function (person) {
				followService.follow(person._id).then(function (result) {
					$scope.person.isFollowing = result
					$rootScope.$emit('update-follow')
				})
			}

			$scope.unfollow = function (person) {
				followService.unfollow(person._id).then(function (result) {
					$scope.person.isFollowing = result
					$rootScope.$emit('update-follow')
				})
			}
		}
	}
})
.directive('newquestions', function ($rootScope, questionsService, followService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/new-questions.htm',
		scope: {
			user: '='
		},
		link: function ($scope, element, attr) {
			$scope.loading = true
			$scope.questions = []
			
			$scope.init = function () {
				questionsService.get(null, 'active', 0, 3).then(function (questions) {
					$scope.loading = false

					if ($scope.questions.length > 0) {
						for (var i in questions) {
							var newq = questions[i]

							for (var j in $scope.questions) {
								var oldq = $scope.questions[j]

								if (newq._id == oldq._id) {
									oldq.liked = newq.liked
									oldq.likes = newq.likes
								}
							}
						}
					} else {
						$scope.questions = questions.map(function (q) {
							q.author.role = q.author.role[0].toUpperCase() + q.author.role.substr(1)

							if (q.text.length > 100) {
								q.text = q.text.substr(0, 100) + '...'
							}

							return q
						})

						async.mapSeries($scope.questions, function (q, next) {
							followService.isFollowing(q.author._id).then(function (result) {
								q.author.isFollowing = result
								next(null, q)
							})
						}, function (err, questions) {
							$scope.questions = questions
						})
					}
				}).catch(function (error) {
					$scope.loading = false
				})
			}

			$scope.init()
			$rootScope.$on('updateQuestionsCounters', $scope.init)

			$scope.refresh = function () {
				$scope.questions = []
				$scope.loading = true
				$scope.init()
			}

			$scope.follow = function (question) {
				followService.follow(question.author._id).then(function (result) {
					question.author.isFollowing = result
				})
			}

			$scope.like = function (question) {
				questionsService.like(question._id).then(function (data) {
					question.liked = true
					question.likes = data.count

					$rootScope.$emit('updateQuestionsCounters')
				})
			}
		}
	}
})
.directive('familiarexperts', function (familiarExpertsService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/familiar-experts.htm',
		link: function ($scope, element, attr) {
			$scope.init = function () {
				$scope.users = []
				$scope.familiarExpertsLoading = true
				familiarExpertsService.get().then(function (users) {
					$scope.users = users
					$scope.familiarExpertsLoading = false
				})
			}
			
			$scope.init()
		}
	}
})
.directive('topbar', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/topbar.htm',
		scope: {
			user: '=',
			q: '=?',
		},
		link: function ($scope, element, attr) {
			if (!$scope.q) {
				$scope.q = ''
			}

			$scope.openUserMenu = function (e) {
				e.stopPropagation()
				$rootScope.$broadcast('open-user-menu')
			}
		}
	}
})
.directive('filters', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/filters.htm',
		link: function ($scope, element) {
			$scope.filters = [
				{
					title: 'Top',
					filter: 'top',
				},
				{
					title: 'News',
					filter: 'news',
				},
				{
					title: 'Journalist',
					filter: 'journalist',
				},
				{
					title: 'Expert',
					filter: 'expert',
				},
				{
					title: 'Photos',
					filter: 'photos',
				},
			]

			$scope.activeFilter = 'news'
			$scope.setFilter = function (filter) {
				$scope.activeFilter = filter
				$rootScope.$emit('feedFilter', filter)
			}
		},
	}
})
.directive('bigratedavatar', function ($timeout, $rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/big-rated-avatar.htm',
		scope: {
			user: '=',
			onEdit: '='
		},
		link: function ($scope, element, attr) {
			if (typeof $scope.onEdit === 'function') {
				$scope.editing = true
				$scope.chooseFile = function () {
					var fileInput = element[0].querySelector('input[type=file]')
					angular.element(fileInput).on('change', function (e) {
						e.stopImmediatePropagation()

						$scope.$apply(function () {
							var file = e.target.files[0]
							$scope.onEdit(file)
						})
					})

					$timeout(function () {
						fileInput.click()
						$timeout.cancel(this)
					}, 0)
				}
			}

			var init = function () {
				var canvas = angular.element(element).find('canvas')[0],
					ctx = canvas.getContext('2d')

				var width = angular.element(element)[0].children[0].offsetWidth,
					height = angular.element(element)[0].children[0].offsetHeight

				angular.element(element).find('canvas').attr('width', width)
				angular.element(element).find('canvas').attr('height', height)

				var borderWidth = 4

				var __start = Date.now()
				var levelInfo = $scope.user.xpInfo
				var __end = Date.now()

				$scope.level = levelInfo.level
				var levelPercentage = ($scope.user.xp - levelInfo.prevLevelXp) / (levelInfo.nextLevelXp - levelInfo.prevLevelXp) * 100

				// Get user XP in radians
				if (!$scope.user.xp) return
				var radsXP = (levelPercentage / 100 * 2) + 1.5

				ctx.lineWidth = borderWidth
				ctx.strokeStyle = '#43abe7'
				ctx.beginPath()
				ctx.arc(width / 2, height / 2, (width / 2) - (borderWidth / 2), 1.5 * Math.PI, radsXP * Math.PI, false)
				ctx.stroke()
			}
			init()

			window.onresize = init
		}
	}
})
.directive('autosuggest', function () {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/autosuggest.htm',
		scope: {
			suggestions: '=',
			ngModel: '=',
			viewTitle: '@',
		},
		link: function ($scope, element, attr) {
			$scope.show = false

			var lastUserValue
			
			$scope.$watch('ngModel', function (newValue, oldValue) {
				if (newValue && newValue.title != oldValue.title && oldValue.title != lastUserValue) {
					$scope.filteredSuggestions = []

					for (var i = 0; i < $scope.suggestions.length; i++) {
						var item = $scope.suggestions[i]

						if (item.title.toLowerCase().indexOf(newValue.title.toLowerCase()) !== -1) {
							$scope.filteredSuggestions.push(item)
						}
					}

					$scope.filteredSuggestions = $scope.filteredSuggestions.slice(0, 7)

					$scope.show = true
				} else {
					$scope.show = false
				}
			}, true)

			$scope.setSuggestion = function (value) {
				lastUserValue = $scope.ngModel.title
				$scope.ngModel = value
				$scope.show = false
			}
		}
	}
})
.directive('lightbox', function () {
	return {
		restrict: 'A',
		scope: {
			ngHref: '=',
		},
		link: function ($scope, element, attr) {
			var imageUrl = window.location.origin + '/' + $scope.ngHref
			var body = angular.element(document.body)

			element.on('click', function (e) {
				e.preventDefault()
				e.stopImmediatePropagation()

				var backdrop = angular.element('<div class="backdrop"></div>'),
					image = angular.element('<div class="image"></div>')

				image.css('backgroundImage', 'url(' + imageUrl + ')')

				backdrop.append(image)
				body.append(backdrop)

				var closeLightbox = function (e) {
					backdrop.remove()
				}

				backdrop.on('click', closeLightbox)
				body.on('keydown', function (e) {
					if (e.keyCode == 27) {
						closeLightbox()
					}
				})
			})
		}
	}
})
.directive('pieces', function (piecesService) {
	return {
		restric: 'E',
		templateUrl: 'assets/views/directives/pieces.htm',
		link: function ($scope, element, attr) {
			piecesService.get().then(function (result) {
				$scope.pieces = result
			}, function () {})
		}
	}
})
.directive('profilecard', function () {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/profilecard.htm',
		scope: {
			user: '=',
		},
		link: function ($scope, element, attr) {
			$scope.image = $scope.user.avatar || '/assets/images/avatar_placeholder.png'
		}
	}
})
.directive('followersicon', function ($rootScope, $interval, $timeout, followService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/followersicon.htm',
		scope: {
			user: '=',
		},
		link: function ($scope, element, attr) {
			$scope.count = $rootScope.badgeFollowers || 0

			$scope.toggleFollow = function (person, $event) {
				$event.stopImmediatePropagation()

				if (person.isFollowing) {
					followService.unfollow(person._id).then(function (result) {
						person.isFollowing = result
					})
				} else {
					followService.follow(person._id).then(function (result) {
						person.isFollowing = result
					})
				}
			}

			angular.element(document.body).on('click', function () {
				$scope.dropdownVisible = false
				$scope.$apply()
			})

			var updateFollowers = function () {
				async.parallel([
					function (cb) {
						followService.followers($scope.user._id, 0, 10, ['createdAt', 'desc']).then(function (followers) {
							followers = followers.map(function (person) {
								person.role = person.role[0].toUpperCase() + person.role.substr(1)
								return person
							})

							$scope.followers = followers

							cb()
						})
					},
					function (cb) {
						followService.unread().then(function (count) {
							$scope.count = $rootScope.badgeFollowers = count

							cb()
						})
					}
				], function () {
					// $scope.$apply()
				})
			}

			$scope.showDropdown = function (e) {
				e.stopImmediatePropagation();

				$timeout(function () {
					document.body.click()
					$scope.dropdownVisible = !$scope.dropdownVisible

					followService.setReadForUser().then(function () {
						$scope.count = $rootScope.badgeFollowers = 0
					})
				}, 10)
			}

			// $interval(updateFollowers, 3000)
			updateFollowers()
		},
	}
})
.directive('notificationsicon', function ($rootScope, $interval, $timeout, notificationService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/notificationsicon.htm',
		scope: {
			user: '=',
		},
		replace: false,
		link: function ($scope, element, attr) {
			$scope.notifications = []
			$scope.count = $rootScope.badgeNotifications || 0

			angular.element(document.body).on('click', function () {
				$scope.dropdownVisible = false
				$scope.$apply()
			})

			var updateNotifications = function (callback) {
				notificationService.get().then(function (result) {
					$scope.count = $rootScope.badgeNotifications = result.count
					$scope.notifications = result.notifications

					if (typeof callback === 'function') callback()
				})
			}

			var refreshInterval = $interval(function () {
				if ($scope.dropdownVisible) return
				updateNotifications()
			}, 3000)

			element.on('$destroy', function () {
				$interval.cancel(refreshInterval)
			})

			$scope.showDropdown = function (e) {
				e.stopImmediatePropagation();
				
				$timeout(function () {
					document.body.click()
					$scope.dropdownVisible = !$scope.dropdownVisible

					notificationService.setReadForUser().then(function () {
						for (var i in $scope.notifications) {
							$scope.notifications[i].read = true
						}

						$scope.count = 0
					})
				}, 10)
			}

			updateNotifications()
		}
	}
})
.directive('wallpaperblock', function ($rootScope, followService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/wallpaperblock.htm',
		scope: {
			type: '=',
			user: '=',
			profile: '=',
		},
		link: function ($scope, element, attr) {
			$scope.follow = function (profile) {
				followService.follow(profile._id).then(function (result) {
					$scope.profile.isFollowing = result
					$rootScope.$emit('update-follow')
				})
			}

			$scope.unfollow = function (profile) {
				followService.unfollow(profile._id).then(function (result) {
					$scope.profile.isFollowing = result
					$rootScope.$emit('update-follow')
				})
			}
		},
	}
})
.directive('profileinfo', function (identityService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/profileinfo.htm',
		scope: {
			profile: '=',
		},
		link: function ($scope, element, attr) {
			identityService.images($scope.profile._id).then(function (images) {
				$scope.images = images
			})
		},
	}
})
.directive('search', function (identityService, $location) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/search.htm',
		scope: {
			q: '=',
		},
		link: function ($scope, element, attr) {
			$scope.dropdownVisible = false
			$scope.loading = false

			angular.element(document.body).on('click', function () {
				$scope.dropdownVisible = false
				$scope.$apply()
			})

			$scope.multisearch = function () {
				var q = $scope.q.trim()

				if (!q) {
					$scope.dropdownVisible = false
					return
				}

				$scope.loading = true

				identityService.multisearch($scope.q).then(function (results) {
					results.users = results.users.map(function (user) {
						user.avatar = user.avatar || '/assets/images/avatar_placeholder.png'
						user.role = user.role[0].toUpperCase() + user.role.substr(1)
						return user
					})

					$scope.results = results

					$scope.loading = false
					$scope.dropdownVisible = true
				})
			}

			element.find('form').on('submit', function (e) {
				e.preventDefault()
				$location.path('/tagsearch/' + $scope.q)
				$scope.$apply()
			})
		},
	}
})
.directive('messagesicon', function ($interval, messagesService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/messagesicon.htm',
		scope: {
			q: '=',
		},
		link: function ($scope, element) {
			var updateUnreadCounter = function () {
				messagesService.unread().then(function (result) {
					$scope.unreadcount = result.count
				})
			}

			var refreshInterval = $interval(function () {
				updateUnreadCounter()
			}, 3000)

			element.on('$destroy', function () {
				$interval.cancel(refreshInterval)
			})

			updateUnreadCounter()
		}
	}
})
.directive('onlineflag', function (identityService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/onlineflag.htm',
		scope: {
			profile: '=',
		},
		link: function ($scope) {
			$scope.loaded = false

			identityService.isOnline($scope.profile._id).then(function (flag) {
				$scope.isOnline = flag
				$scope.loaded = true
			})
		}
	}
})