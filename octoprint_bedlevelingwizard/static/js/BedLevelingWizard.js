/*
 * View model for OctoPrint-BedLevelingWizard
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function() {
    function BedlevelingwizardViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0];
		self.printerProfilesViewModel = parameters[1];
		self.controlViewModel = parameters[2];
		self.loginStateViewModel = parameters[3];

		self.started = ko.observable();
		self.stage = ko.observable();
		self.current_point = ko.observable();
		self.point_a = ko.observableArray();
		self.point_b = ko.observableArray();
		self.point_c = ko.observableArray();
		self.point_d = ko.observableArray();
		self.offset_xy = ko.observable();
		self.offset_z = ko.observable();
		self.offset_z_travel = ko.observable();
		self.speed_xy = ko.observable();
		self.speed_z_probe = ko.observable();
		self.travel_speed = ko.computed(function(){return self.speed_xy()*60});
		self.travel_speed_probe = ko.computed(function(){return self.speed_z_probe()*60});
		self.gcode_cmds = ko.observableArray();

		self.onBeforeBinding = function() {
			self.stage('Start');
			self.started(false);
			self.current_point(0);
			self.offset_xy(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_xy());
			self.offset_z(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_z());
			self.offset_z_travel(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_z_travel());
			self.speed_xy(self.settingsViewModel.settings.plugins.bedlevelingwizard.speed_xy());
			self.speed_z_probe(self.settingsViewModel.settings.plugins.bedlevelingwizard.speed_z_probe());
		}

		self.onEventSettingsUpdated = function (payload) {
			self.offset_xy(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_xy());
			self.offset_z(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_z());
			self.offset_z_travel(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_z_travel());
			self.speed_xy(self.settingsViewModel.settings.plugins.bedlevelingwizard.speed_xy());
			self.speed_z_probe(self.settingsViewModel.settings.plugins.bedlevelingwizard.speed_z_probe());
		}

		self.start_level = function(){
			if(!self.started()){
				self.started(true);
				self.stage('Next');
				var volume = self.printerProfilesViewModel.currentProfileData().volume
				console.log(volume);
				if(typeof volume.custom_box !== 'function'){
					console.log('Using custom box options');
					var min_x = parseInt(volume.custom_box.x_min());
					var max_x = parseInt(volume.custom_box.x_max());
					var min_y = parseInt(volume.custom_box.y_min());
					var max_y = parseInt(volume.custom_box.y_max());
				} else {
					console.log('Using width and depth');
					var min_x = 0;
					var max_x = parseInt(volume.width());
					var min_y = 0;
					var max_y = parseInt(volume.depth());
				}

				self.point_a([min_x + parseInt(self.offset_xy()),min_y + parseInt(self.offset_xy())]);
				self.point_b([max_x - parseInt(self.offset_xy()),max_y - parseInt(self.offset_xy())]);
				self.point_c([max_x - parseInt(self.offset_xy()),min_y + parseInt(self.offset_xy())]);
				self.point_d([min_x + parseInt(self.offset_xy()),max_y - parseInt(self.offset_xy())]);

				self.gcode_cmds.push('G90');
				self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());
				self.gcode_cmds.push('G28');
				self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());
			} else if(self.stage() !== 'Finish'){
				if(self.current_point() < 8){
					self.gcode_cmds.push('G90');
					self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());

					switch(self.current_point() % 4){
						case 0:
							self.gcode_cmds.push('G1 X'+self.point_a()[0]+' Y'+self.point_a()[1]+' F'+self.travel_speed());
							self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
							break;
						case 1:
							self.gcode_cmds.push('G1 X'+self.point_b()[0]+' Y'+self.point_b()[1]+' F'+self.travel_speed());
							self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
							break;
						case 2:
							self.gcode_cmds.push('G1 X'+self.point_c()[0]+' Y'+self.point_c()[1]+' F'+self.travel_speed());
							self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
							break;
						case 3:
							self.gcode_cmds.push('G1 X'+self.point_d()[0]+' Y'+self.point_d()[1]+' F'+self.travel_speed());
							self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
							break;
						default:
							console.log('something went wrong');
					}

					if(self.current_point() == 7) {
						self.stage('Finish');
					}

					self.current_point(self.current_point()+1);
				}
			} else {
				self.gcode_cmds.push('G90');
				self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());
				self.gcode_cmds.push('G28 X0 Y0');
				self.stop_level();
			}

			console.log('sending commands for point '+self.current_point()+': '+self.gcode_cmds());
			OctoPrint.control.sendGcode(self.gcode_cmds());
			self.gcode_cmds([]);
		}

		self.stop_level = function(){
			console.log('Stopping Bed Leveling Wizard.');
			self.started(false);
			self.stage('Start');
			self.current_point(0);
		}

    }

    OCTOPRINT_VIEWMODELS.push({
        construct: BedlevelingwizardViewModel,
        dependencies: ['settingsViewModel','printerProfilesViewModel','controlViewModel','loginStateViewModel'],
        elements: ['#settings_plugin_bedlevelingwizard', '#tab_plugin_bedlevelingwizard']
    });
});
