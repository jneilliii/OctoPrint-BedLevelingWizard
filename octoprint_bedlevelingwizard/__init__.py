# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin

class BedlevelingwizardPlugin(octoprint.plugin.SettingsPlugin,
                              octoprint.plugin.AssetPlugin,
                              octoprint.plugin.TemplatePlugin):

	##~~ SettingsPlugin mixin

	def get_settings_defaults(self):
		return dict(
			speed_xy=80,
			speed_z_probe=20,
			offset_xy=10,
			offset_z=0.1,
			offset_z_travel=10
		)

	##~~ AssetPlugin mixin

	def get_assets(self):
		return dict(
			js=["js/BedLevelingWizard.js"]
		)
		
	#~~ TemplatePlugin mixin

	def get_template_configs(self):
		return [
			dict(type="sidebar", icon="arrows-alt"),
			dict(type="settings")
		]

	##~~ Softwareupdate hook

	def get_update_information(self):
		return dict(
			BedLevelingWizard=dict(
				displayName="OctoPrint-BedLevelingWizard",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="jneilliii",
				repo="OctoPrint-BedLevelingWizard",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/jneilliii/OctoPrint-BedLevelingWizard/archive/{target_version}.zip"
			)
		)

__plugin_name__ = "Bed Leveling Wizard"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = BedlevelingwizardPlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}

