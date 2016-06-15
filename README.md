
# Project- 5  Neighborhood Map- Udacity

## Overview
This single page application is a search for available Restaurants in a given city. It provides a list of restaurants in a given city with a marker marking its location on the map. And clicking on a marker, shows a review for the that location as provided by Yelp. To read more about what other people have to say, there is a link in the review window to lead you to the Yelp Review Page for that restaurant. There is also a search bar to narrow down that list to easily choose a restaurant  by name and read its reviews on yelp to help you decide if its a good choice for eating out!


## Instructions for use:
- Clone the repository to your computer.
- Double click "index.html" to open the app in your browser.
- Enter a city(must be a U.S. city) to start your search
- Click on markers to see the restaurant closest to your location and read what others have to say about it.
- Or browse through the list to find a restaurant you like and find its location and reviews.
- Or if you don't feel like going through the whole list and know your restaurant, enter the name in the search bar and have the list and markers filtered for your ease.
- If you want to do a search in a different city, press the **"Change City"** button to start all over again


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
- Added city search feature to select any city.
- Modified CSS to make application responsive and beautiful.

## Future Modifications
- Add choice for establishments.
- Add images of establishment to provide additional details about a restaurant.

## Resources Used
- stackoverflow.com
- google search
- KnockoutJS documentation
- Udacity-Intro to Ajax
- Udacity-Javascript Design Patterns
