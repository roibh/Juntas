function loginfacebook(callback) {
	chrome.windows
			.create(
					{
						'url' : "https://www.facebook.com/dialog/oauth?"
								+ "display=popup&"
								+ "client_id=1613231555594185&"
								+ "redirect_uri=https://www.facebook.com/connect/login_success.html&"
								+ "scope=publish_actions&" + "response_type=token",
						'width' : 580,
						'height' : 400
					},
					function(popupWindow) {
						chrome.tabs
								.query(
										{
											active : true
										},
										function(tabs) {
											tabid = tabs[0].id;
											chrome.tabs.onUpdated
													.addListener(function(
															tabid, tab) {
														var tabUrl = tab.url;
														var accessTokenMatcher = null;
														var expiresInMatcher = null;
														if (tabUrl != null) {
															accessTokenMatcher = tabUrl
																	.match(/[\\?&#]access_token=([^&#])*/i);
															expiresInMatcher = tabUrl
																	.match(/expires_in=.*/);
														}
														if (accessTokenMatcher != null) {
															token = accessTokenMatcher[0];
															token = token
																	.substring(14);
															expires_in = expiresInMatcher[0];
															expires_in = expires_in
																	.substring(11);
															localStorage.accessToken = token;
															var currentDate = new Date();
															var expiryTime = currentDate
																	.getTime()
																	+ 1000
																	* (expires_in - 300);
															localStorage.expiryTime = expiryTime;
															chrome.windows
																	.remove(popupWindow.id);
															callback();
														}
														;
													});
										});
					});

}