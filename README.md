# Recrafting Craft

This project was based on hp-research-awards by Silvio Lorusso (https://github.com/silviolorusso/hp-research-awards).

### SETUP
Recrafting Craft, by Mascha van Zijverden, consists of 10 parts, all of somewhat equal importance. These parts are:
- Preface by Jose Teunissen;
- Introductory text by Mascha van Zijverden herself;
- 6 scenarios for future fashion education by Dirk Osinga and illustrated by Georg Bohle;
- 2 essays by Bibi Straatman and Oscar Tomico;

### PRINT
In the printed version Mascha’s part is used as a wrapper around all other parts, to emphasize the fact that she is the initiator and curator of this project. All other parts are printed on 7 different newspaper spreads. The newspaper is not stapled, so these parts have no particular order and are non-linear. 

![Recrafting Craft](assets/recrafting_craft.png)

### WEBPAGE
The setup for the webpage is a Side Navigation Menu with keywords and a Main Part with the content, the latter one is build up by 10 blocks [divs]. Each block contains one part (i.e. text or scenario). When opening the webpage all parts are in a specific order, set by the author. 

The Side Navigation Menu consists of all the keywords in alphabetical order. Each part has serval keywords, but these connections are only visible after clicking one of the keywords.

The content of the blocks changes when a Side Navigation Menu Item is clicked. After a button is clicked the corresponding part is placed in the first block. The other parts are placed in a random order in the remaining 9 blocks. Also, the ‘active’ keyword is turned blue, and well are the other connected keywords.

![Set up webpage](assets/1.png)

#### SIDE NAVIGATION MENU
The Side Navigation Menu has 3 components: 
- A ‘home’ button, which takes you back to the fullscreen landing page;
- Contents, which is collapsed by default and consists of all parts by title.
- Index, which consists of all keywords in alphabetical order.

#### THE CODE
Each keyword or chapter in contents is a button with two functions with parameters and one closing function. 

Example of a keyword button:
> ```<button class="jose" onclick="changeText(fibl, jose); chbg(josec); closeNav()">&mdash; Preface - José Teunissen</button>```

- When a button is clicked the first function [changeText] changes the content of the first block on the page [fibl] with the content of the second parameter [set as a VAR in bundle.js]. 
- The second function [chbg] changes all the connected keywords blue when one of them is clicked. The parameter connects the keywords that belong to one part.
- The close function [closeNav] closes the Side Navigaition Menu after a keyword is clicked and the order of the texts is shifted.

