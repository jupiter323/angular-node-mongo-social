angular.module('er.directives', [])
.directive('dropdown', function () {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/dropdown.htm',
		scope: {
			title: '@',
			defaultItem: '=',
			list: '=',
			chosen: '=',
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

			dropdownButton.on('click', function (e) {
				dropdownLists.removeClass('active')

				e.stopImmediatePropagation()
				dropdownList.toggleClass('active')
				angular.element(document.body).triggerHandler('shadow-click')
			})

			$scope.isActiveParentItem = function (parentItem) {
				for (var i in parentItem.sub) {
					if (parentItem.sub[i].id === $scope.chosen.id) return true
				}
			}

			$scope.isActiveItem = function (item) {
				return $scope.chosen.id == item.id
			}

			$scope.choose = function (item) {
				$scope.change(item)
				dropdownList.removeClass('active')
			}
		}
	}
})
.directive('usermenu', function ($auth, $rootScope, $cookies, $location, identityService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/usermenu.htm',
		scope: {user: '='},
		link: function ($scope, element, attr) {
			$scope.logout = function () {
				$cookies.remove('user')
				$auth.logout()
				identityService.clean()
				$location.url('/start')
			}

			$scope.$on('open-user-menu', function (e, data) {
				$scope.active = true
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
			user: '='
		},
		link: function ($scope, element, attr) {
			$scope.number = $scope.user.rating || 1
			$scope.color = $scope.user.color || 'bronze'
			$scope.image = $scope.user.avatar || '/assets/images/avatar_placeholder.png'
			$scope.role = $scope.user.role || 'User'
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
						$scope.$parent.$emit('reloadfeed')

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
.directive('feed', function ($rootScope, feedService, commentService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/feed.htm',
		link: function ($scope, element, attr) {
			// $scope.user = $scope.$parent.user

			$scope.$parent.$on('reloadfeed', function () {
				init()
			})

			$scope.$watch('user', function (newValue, oldValue) {
				if (JSON.stringify(newValue) != JSON.stringify(oldValue)) {
					init()
				}
			})

			var init = function () {
				var feedType = 'all'
				if (!$rootScope.user) {
					feedType = 'all'
				}

				$scope.feedLoading = true
				$scope.feed = []
				feedService[feedType]().then(function (feed) {
					$scope.feedLoading = false
					$scope.feed = feed
				})
			}

			init()
		}
	}
})
.directive('post', function ($timeout, commentService, reactionsService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/post.htm',
		scope: {
			post: '='
		},
		link: function ($scope, element, attr) {
			$scope.files = []

			$scope.user = $scope.$parent.user

			$scope.addComment = function (post) {
				if ($scope.loading) return
				$scope.loading = true

				var fileObjects = $scope.files.map(function (file) {
					return file.fileObject
				})

				var progress = function () {
					
				}

				commentService.add(post._id, post.commentText, fileObjects).then(function () {
					post.commentText = ''
					$scope.files = []
					$scope.$emit('reloadcomments', post._id)
					$scope.loading = false
				}, function () {
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

			$scope.react = function (post, type, unreact) {
				var action = 'react'
				if (unreact) action = 'unreact'

				reactionsService[action](post._id, type).then(function (result) {
					$scope.$emit('reloadreactions', post._id)
				}, function (error) {
					console.log('Reaction failed')
					console.log(error)
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

			$scope.$parent.$on('reloadreactions', function (event, postId) {
				if (postId != $scope.post._id) return
				init()
			})
		},
	}
})
.directive('postcomments', function (postService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/postcomments.htm',
		scope: {
			post: '='
		},
		link: function ($scope, element, attr) {
			$scope.showmore = false

			$scope.comments = []

			$scope.$parent.$on('reloadcomments', function (e, args) {
				// console.log(args)
				init()
			})

			var init = function () {
				postService.getComments($scope.post._id).then(function (comments) {
					$scope.comments = comments
					$scope.$parent.commentsCount = $scope.comments.length
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

					reactions.likes = numeral(reactions.likes).format('0a').toUpperCase()
					reactions.dislikes = numeral(reactions.dislikes).format('0a').toUpperCase()

					$scope.reactions = reactions
					$scope.$apply()
				}, function (error) {
					console.error(error)
				})
			}

			init()

			$scope.$parent.$on('reloadcommentreactions', function (event, commentId) {
				if (commentId != $scope.comment._id) return
				init()
			})

			$scope.react = function (comment, type, unreact) {
				var action = 'react'
				if (unreact) action = 'unreact'

				commentReactionsService[action](comment._id, type).then(function (result) {
					$scope.$emit('reloadcommentreactions', comment._id)
				}, function (error) {
					console.log('Reaction failed')
					console.log(error)
				})
			}
		},
	}
})
.directive('question', function () {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/question.htm',
		scope: {
			question: '='
		},
	}
})
.directive('familiarexpert', function () {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/familiar-expert.htm',
		scope: {
			user: '='
		},
	}
})
.directive('newquestions', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/new-questions.htm',
		scope: {
			user: '='
		},
		link: function ($scope, element, attr) {
			$scope.questions = $rootScope.user.questions
		}
	}
})
.directive('familiarexperts', function (familiarExpertsService) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/familiar-experts.htm',
		link: function ($scope, element, attr) {
			$scope.users = []
			$scope.familiarExpertsLoading = true
			familiarExpertsService.then(function (users) {
				$scope.users = users
				$scope.familiarExpertsLoading = false
				$scope.$apply()
			})
		}
	}
})
.directive('topbar', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/topbar.htm',
		scope: {user: '='},
		link: function ($scope, element, attr) {
			$scope.openUserMenu = function (e) {
				e.stopPropagation()
				$rootScope.$broadcast('open-user-menu')
			}
		}
	}
})
.directive('filters', function () {
	return {
		restrict: 'E',
		templateUrl: 'assets/views/directives/filters.htm',
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
				$scope.chooseFile = function (e) {
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


			var canvas = angular.element(element).find('canvas')[0],
				ctx = canvas.getContext('2d')

			var width = angular.element(element)[0].children[0].offsetWidth,
				height = angular.element(element)[0].children[0].offsetHeight

			angular.element(element).find('canvas').attr('width', width)
			angular.element(element).find('canvas').attr('height', height)

			var borderWidth = 4

			// Get user XP in radians
			var radsXP = ($rootScope.user.xp / 100 * 2) + 1.5

			ctx.lineWidth = borderWidth
			ctx.strokeStyle = '#43abe7'
			ctx.beginPath()
			ctx.arc(width / 2, height / 2, (width / 2) - (borderWidth / 2), 1.5 * Math.PI, radsXP * Math.PI, false)
			ctx.stroke()
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

				var backdrop = angular.element('<div class="backdrop"></div>'),
					image = angular.element('<div class="image"></div>')

				image.css('backgroundImage', 'url(' + imageUrl + ')')

				backdrop.append(image)
				body.append(backdrop)

				var closeLightbox = function (e) {
					backdrop.remove({})
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