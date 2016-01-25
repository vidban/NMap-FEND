# Project- 5  Neighborhood Map- Udacity

Click [here](http://vidban.github.io/NMap-FEND/) to see it in action

## Instructions for use:
Fork the repository and clone it to your computer. Double click "index.html" to open the app in your browser. 

## Features:
 This is a single page application featuring a map centered at MountainView. It includes a list of Restaurants in that city.
 Also features a search bar to narrow down that list to easily choose a restaurant  by name and read its reviews on yelp to help you decide if its a good choice for eating out!

## Skills learned:
- Develop manageable codebase
- Utilize knockoutJS to decrease the time required for developing by using readymade utilities.
- Implement third-party API(Yelp) to provide reviews thus enhancing the quality and functionality of this application.
- Importance of a Plan of action(how to approach it)

## Approach
- Used Google Maps API to show google map and centered it to Mountain View using Latitude and Longitude
- Decided on Restaurants as establishment and shortlisted it for type for google map's nearbySearch Service
- Dropped markers using the Maps API to pin location of each restaurant.
- Used KnockoutJS to populate a table with the list of the names of all restaurants found
- Added click functionality to markers to open an infowindow to show description of location
- Used KnockoutJS to implement filter search function on the list and the markers
- Bound list click with Marker click to show description of location when its name was clicked on the list as well
- Added Ajax call to Yelp api to add corresponding reviews to the locations infowindow
- Modified CSS to make application responsive and beautiful.

## Future Modifications
- Add choice for establishments and cities.
- Add other API's like Foursquare and such to provide additional details

## Resources Used
- stackoverflow.com
- google search
- KnockoutJS documentation
- Udacity-Intro to Ajax
- Udacity-Javascript Design Patterns
