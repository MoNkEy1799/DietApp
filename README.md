# DietApp 🍩
A very basic PWA for tracking nutrition values and weight. It also offers options to save nurtitional values for foods and create receipes.

## Installation
The easiest way to install the PWA is via a USB connection and the `run_install_server.bat` file. The necessary steps are explained in there. The USB drivers for android phones as well as the Android Debug Bridge is also provided in the repo. If the install prompt is not shown in the browser when accessing localhost:8000, use the 'add to home screen' option (at least for chrome).

## Features
### Person selector
At the top of the page you can choose up to 2 different persons. The tracker values, weights, and settings are stored per person. Foods/receipes are available for both.
### Tracker
In the 'tracker' tab you can see the current calories and protein amounts left for the day. By changing the day in the dropdown, you can view these values for yesterday or tomorrow. You can either add calories and protein value directly or enter an amount (in g) and a food name. You can then choose if you want to e.g. add these values for today or for tomorrow.
### Food
The 'food' tab allows to add food items to the storage. Enter a name and the amount of calories and protein per 100g.

Containers are cooking containers (e.g. pots, pans, etc.) that you can store by giving them a name and providing the weight of the container. These are necessary for the receipes.

You can add a receipe by choosing a already added food and an amount to put into the receipe. All items in the current receipe are listed and can be removed again. To save a receipe, choose a name and a container and provide the total weight of the cooked food + container (it is usually easier to measure the total weight). The app will then calculate the protein and calories perr 100g for the receipe by calculating the total nutritional value and dividing it by the weight (excluding the container).

In the list below, you can find all food items, receipes and containers with the option to remove them from the list.

### Weight
Add a body weight and a date to track your current weight and displays the progress on the graph

### Settings
Here you can choose the daily amount of protein and calories for each person. You also have the option to save (and later read in) all stored data in the app to a .txt file. This is just for backup reasons since the app data will be deleted when the browser cache is deleted. So you can backup all stored foods/receipes here. In the log table, the last executed commands are shown, in case you e.g. remove something by accident and want to see the original values.
