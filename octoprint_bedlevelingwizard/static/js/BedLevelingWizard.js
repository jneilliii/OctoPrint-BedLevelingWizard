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
		self.travel_speed = ko.computed(function(){return self.speed_xy()*60;});
		self.travel_speed_probe = ko.computed(function(){return self.speed_z_probe()*60;});
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
		};

		self.onEventSettingsUpdated = function (payload) {
			self.offset_xy(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_xy());
			self.offset_z(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_z());
			self.offset_z_travel(self.settingsViewModel.settings.plugins.bedlevelingwizard.offset_z_travel());
			self.speed_xy(self.settingsViewModel.settings.plugins.bedlevelingwizard.speed_xy());
			self.speed_z_probe(self.settingsViewModel.settings.plugins.bedlevelingwizard.speed_z_probe());
		};

		self.start_level = function(){
			if(!self.settingsViewModel.settings.plugins.bedlevelingwizard.use_custom_points()){ // use bed offsets
				if(!self.started()){
					self.started(true);
					self.stage('Next');
					var volume = self.printerProfilesViewModel.currentProfileData().volume;
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
					var stack_bottomleft = {dir1: 'right', dir2: 'up', push: 'top'};
					var stack_bottomcenter = {"dir1": "up", "dir2": "right", "push": "bottom", "firstpos2": ($(document).width()/2-150)};
					self.notify = new PNotify({
										title: 'Bed Leveling Wizard',
										text: 'Starting the guided leveling process. Configured Start GCode commands were just sent to your printer. Pre-heat bed and nozzle if desired and verify nozzle is clear of debris. \n\nWhen ready press Next.',
										type: 'info',
										hide: false,
										buttons: {
											closer: true,
											sticker: false
										},
										addclass: 'stack-bottomleft',
										stack: stack_bottomcenter
										}
									);

                    self.gcode_cmds.push(...self.settingsViewModel.settings.plugins.bedlevelingwizard.start_gcode().split('\n'));
					self.gcode_cmds.push('G90');
					self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());
				} else if(self.stage() !== 'Finish') {
					if(self.current_point() < 8){
						self.gcode_cmds.push('G90');
						self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());

						switch(self.current_point() % 4) {
							case 0:
								self.gcode_cmds.push('G1 X'+self.point_a()[0]+' Y'+self.point_a()[1]+' F'+self.travel_speed());
								self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
								var options = {text: 'You are at the first leveling position.  Adjust the bed to be a height of "0" and press Next.'};
								break;
							case 1:
								self.gcode_cmds.push('G1 X'+self.point_b()[0]+' Y'+self.point_b()[1]+' F'+self.travel_speed());
								self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
								var options = {text: 'You are at the second leveling position.  Adjust the bed to be a height of "0" and press Next.'};
								break;
							case 2:
								self.gcode_cmds.push('G1 X'+self.point_c()[0]+' Y'+self.point_c()[1]+' F'+self.travel_speed());
								self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
								var options = {text: 'You are at the third leveling position.  Adjust the bed to be a height of "0" and press Next.'};
								break;
							case 3:
								self.gcode_cmds.push('G1 X'+self.point_d()[0]+' Y'+self.point_d()[1]+' F'+self.travel_speed());
								self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
								var options = {text: 'You are at the fourth leveling position.  Adjust the bed to be a height of "0" and press Next.'};
								break;
							default:
								console.log('something went wrong');
						}

						if(self.current_point() == 7) {
							self.stage('Finish');
							var options = {text: 'You are at the fourth and final leveling position.  Adjust the bed to be a height of "0" and press Finish to home X and Y axis.'};
						}

						self.current_point(self.current_point()+1);
					}
				} else {
					self.gcode_cmds.push('G90');
					self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());
                    self.gcode_cmds.push(...self.settingsViewModel.settings.plugins.bedlevelingwizard.end_gcode().split('\n'));
					var options = {text: 'Guided leveling process complete. Configured End GCode commands were just sent to your printer. Thank you for using the Bed Leveling Wizard.'};
					self.stop_level();
				}
			} else { // use custom points
				if(!self.started()){
					self.started(true);
					self.stage('Next');
					var stack_bottomleft = {dir1: 'right', dir2: 'up', push: 'top'};
					var stack_bottomcenter = {"dir1": "up", "dir2": "right", "push": "bottom", "firstpos2": ($(document).width()/2-150)};
					self.notify = new PNotify({
										title: 'Bed Leveling Wizard',
										text: 'Starting the guided leveling process.  Configured Start GCode commands were just sent to your printer. Pre-heat bed and nozzle if desired and verify nozzle is clear of debris. \n\nWhen ready press Next.',
										type: 'info',
										hide: false,
										buttons: {
											closer: true,
											sticker: false
										},
										addclass: 'stack-bottomleft',
										stack: stack_bottomcenter
										}
									);

                    self.gcode_cmds.push(...self.settingsViewModel.settings.plugins.bedlevelingwizard.start_gcode().split('\n'));
					self.gcode_cmds.push('G90');
					self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());
				} else if(self.stage() !== 'Finish'){
					self.gcode_cmds.push('G90');
					self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());

					var custom_points = self.settingsViewModel.settings.plugins.bedlevelingwizard.custom_points();
					if(self.current_point() < custom_points.length){
						self.gcode_cmds.push('G1 X'+custom_points[self.current_point()].point_x()+' Y'+custom_points[self.current_point()].point_y()+' F'+self.travel_speed());
						self.gcode_cmds.push('G1 Z'+self.offset_z()+' F'+self.travel_speed_probe());
						if (self.current_point() == custom_points.length-1) {
							self.stage('Finish');
							var options = {text: 'You are at the last custom point ' + custom_points[self.current_point()].point_x() + ', ' + custom_points[self.current_point()].point_y() + '.  Adjust the bed to be a height of "0" and press Finish to home X and Y axis.'};
						} else {
							var options = {text: 'You are at point ' + custom_points[self.current_point()].point_x() + ', ' + custom_points[self.current_point()].point_y() + '.  Adjust the bed to be a height of "0" and press Next.'};
						}
						self.current_point(self.current_point()+1);
					}
				} else {
					self.gcode_cmds.push('G90');
					self.gcode_cmds.push('G1 Z'+self.offset_z_travel()+' F'+self.travel_speed_probe());
                    self.gcode_cmds.push(...self.settingsViewModel.settings.plugins.bedlevelingwizard.end_gcode().split('\n'));
					var options = {text: 'Guided leveling process complete. Configured End GCode commands were just sent to your printer. Thank you for using the Bed Leveling Wizard.'};
					self.stop_level();
				}
			}

			console.log('sending commands for point '+self.current_point()+': '+self.gcode_cmds());
			OctoPrint.control.sendGcode(self.gcode_cmds());
			self.gcode_cmds([]);
			self.notify.update(options);
		};

		self.stop_level = function(){
			console.log('Stopping Bed Leveling Wizard.');
			self.started(false);
			self.stage('Start');
			self.current_point(0);
			var options = {hide: true};
			self.notify.update(options);
		};

		self.addPoint = function(){
			self.settingsViewModel.settings.plugins.bedlevelingwizard.custom_points.push({'point_x':ko.observable(0),'point_y':ko.observable(0)});
		};

		self.removePoint = function(data){
			self.settingsViewModel.settings.plugins.bedlevelingwizard.custom_points.remove(data);
		};

		self.move = function(amount, $index) {
			var index = $index();
			var item = self.settingsViewModel.settings.plugins.bedlevelingwizard.custom_points.splice(index, 1)[0];
			var newIndex = Math.max(index + amount, 0);
			self.settingsViewModel.settings.plugins.bedlevelingwizard.custom_points.splice(newIndex, 0, item);
		};

		self.moveUp = self.move.bind(self, -1);
		self.moveDown = self.move.bind(self, 1);

    self.onAfterTabChange = function (current, previous) {
        if (window.location.href.indexOf('blwfullscreen') > 0 && !$('#sidebar_plugin_bedlevelingwizard').hasClass('fullscreen')) {
                $('#sidebar_plugin_bedlevelingwizard').addClass('fullscreen');
                let background_color = ($('body').css('background-color') == 'rgba(0, 0, 0, 0)') ? '#FFFFFF' : $('#tabs_content').css('background-color');
                $('#sidebar_plugin_bedlevelingwizard').css('background-color', background_color);
                $('body').css('overflow-x', 'hidden');
                $('body').css('overflow-y', 'hidden');
                $('#sidebar_plugin_bedlevelingwizard button').addClass('btn-large');
            }
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: BedlevelingwizardViewModel,
        dependencies: ['settingsViewModel','printerProfilesViewModel','controlViewModel','loginStateViewModel'],
        elements: ['#settings_plugin_bedlevelingwizard','#sidebar_plugin_bedlevelingwizard']
    });
});
