# Bed Leveling Wizard

This plugin implements a guided leveling approach to manual bed leveling.  It is intended to help in positioning the nozzle consistantly in all three axes during a manual leveling process.  The plugin will move the nozzle to 4 calculated leveling positions in a figure eight pattern, pausing at each to allow for bed height adjustment.

When ready to manually level your bed press the Start button in the sidebar and the nozzle will move to the home position.  Adjust bed and nozzle temperature if desired at this stage (not necessary) verify nozzle is clean of debris, etc. and press the next button.  

Nozzle will move to the first calculated leveling position based on configured offsets (Settings Explained below). Adjust your bed so the nozzle's tip is at a Z height of "0".  This is typically the gap of a piece of paper as described in several how-to videos on the internet. When satisfied with your adjustment press the next button.

Nozzle will move to the diagonally opposite calculated leveling position on the bed. Adjust the bed as previously described and then press the next button to continue the guided leveling process.  

Nozzle moves to the third calculated leveling position on the bed. Adjust the bed as previously described. When satisifed press next button to continue the guided leveling process.

Nozzle moves digonally to the fourth calculated leveling position on the bed.  Adjust the bed as previously deescribed and press the next button to continue the guided leveling process. 

Nozzle returns to the first calculated leveling position and the process repeats.  Adjust the height of the bed at each of the remaining leveling positions and the Next button will become Finish button, which when pressed will home the nozzle in the X and Y axes and the guided leveling process is complete.



**Notes**:
  - You can stop the process at any time by pressing the Stop button.  It is not required to cycle through the second cycle, but is a good approach to verifyying your manual leveling is correct.
  - Plugin developed for community forum request by [madmax2](https://discourse.octoprint.org/u/madmax2). Background information can be found [here](https://discourse.octoprint.org/t/manual-bed-leveling-wizard-plugin-suggestion-request/2736/25).
  - Unlike some other leveling wizard tools included in other software packages, this plugin does not actually print any test pattersns to verify the accuracy of the guided leveling process currently.
  - Currently really only works with cartesian printers.
  - Future updates to include the ability to enter leveling positions manually to allow for delta printers, increased leveling positions, more exact positions (ie directly above bed leveling screw) vs just using offset positions.

## Screenshot

![screenshot](sidebar.png)

## Settings Explained

Configure default settings in OctoPrint's settings area.  

![screenshot](settings.png)

  - X/Y Offset: Distance from bed's perimeter and nozzle.  Used for calculating the nozzle positions during the guided leveling process.
  - X/Y Speed: Speed of nozzle movements between calculated leveling positions.
  - Z Travel Height: Distance between nozzle and height of "0". Used during nozzle movements between calculated leveling positions.
  - Z Speed: Speed of nozzle movements during the transition from "Z Travel Height" to "Z Leveling Height".
  - Z Leveling Height: Distance of nozzle above a Z height of "0".  This is allowed to be adjusted so you can use any known thickness measuring device (ie. gap tool).
  - Use Custom Points: Allows for entering your own set of custom points to probe during the guided leveling process in lieu of the bed offset based method.

## Get Help

If you experience issues with this plugin or need assistance please use the issue tracker by clicking issues above.

### Additional Plugins

Check out my other plugins [here](https://plugins.octoprint.org/by_author/#jneilliii)

### Sponsors
- Andreas Lindermayr
- [@Mearman](https://github.com/Mearman)
- [@TheTuxKeeper](https://github.com/thetuxkeeper)
- [@tideline3d](https://github.com/tideline3d/)
- [OctoFarm](https://octofarm.net/)
- [SimplyPrint](https://simplyprint.dk/)
- [Andrew Beeman](https://github.com/Kiendeleo)
- [Calanish](https://github.com/calanish)
- [Will O](https://github.com/4wrxb)
- [Lachlan Bell](https://lachy.io/)
- [Johnny Bergdal](https://github.com/bergdahl)
- [Leigh Johnson](https://github.com/leigh-johnson)
- [Stephen Berry](https://github.com/berrystephenw)
- [Guyot François](https://github.com/iFrostizz)
- César Romero
- [Steve Dougherty](https://github.com/Thynix)
- [Kyle Menigoz](https://menigoz.me)
## Support My Efforts
I, jneilliii, programmed this plugin for fun and do my best effort to support those that have issues with it, please return the favor and leave me a tip or become a Patron if you find this plugin helpful and want me to continue future development.

[![Patreon](patreon-with-text-new.png)](https://www.patreon.com/jneilliii) [![paypal](paypal-with-text.png)](https://paypal.me/jneilliii)

<small>No paypal.me? Send funds via PayPal to jneilliii&#64;gmail&#46;com</small>
