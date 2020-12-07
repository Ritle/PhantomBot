/*
 * Copyright (C) 2016-2020 phantombot.github.io/PhantomBot
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * topCommand.js
 *
 * Build and announce lists of top viewers (Highest points, highest time spent in the channel) 
 
 */
(function() {
    var amountPoints = $.getSetIniDbNumber('settings', 'topListAmountPoints', 5),// variable storing point value
        amountTime = $.getSetIniDbNumber('settings', 'topListAmountTime', 5);// variable storing the amount of time

    /*
     * @function reloadTop -top reload function
     */
    function reloadTop() {
        amountPoints = $.getIniDbNumber('settings', 'topListAmountPoints');
        amountTime = $.getIniDbNumber('settings', 'topListAmountTime');
    }

    /*
     * @function getTop5 - function of getting 5 top users
     *This function gets a list of the first five users depending on the request. The loop iterates over the keys and adds them to the array. 
      Finally, the function returns a list of users by time or score
     * @param {string} iniName
     * @returns {Array} - returns an array of users
     */
    // Function of getting the first 5 users of the top by time and points
    function getTop5(iniName) {
        var keys = $.inidb.GetKeysByNumberOrderValue(iniName, '', 'DESC', (iniName.equals('points') ? amountPoints + 2: amountTime + 2), 0),
            list = [],
            i,
            ctr = 0;
// Cycle for creating a list of users by points or time
        for (i in keys) {
            if (!$.isBot(keys[i]) && !$.isOwner(keys[i])) {
                if (ctr++ == (iniName.equals('points') ? amountPoints : amountTime)) {
                    break;
                }
                list.push({ // Adding user + value to the array obtained by key                
                    username: keys[i],
                    value: $.inidb.get(iniName, keys[i])
                });
            }
        }
//Sorting the resulting array
        list.sort(function(a, b) {
            return (b.value - a.value);
        });
//Return an array of users depending on the request (time or points)
        if (iniName.equals('points')) {
            return list.slice(0, amountPoints);
        } else {
            return list.slice(0, amountTime);
        }
    }

    /*
     * @event command Обработчик команд 
     */
    $.bind('command', function(event) {
        var command = event.getCommand(),
            args = event.getArgs(),
            sender = event.getSender(),
            action = args[0];

        /**
         * @commandpath top - Display the top people with the most points - If the user enters top into the chat,
         then the system will refer to the stream points module, if available, and display the first five users, if any
         */
        if (command.equalsIgnoreCase('top')) {
            if (!$.bot.isModuleEnabled('./systems/pointSystem.js')) {
                return;
            }
 // Access to the function of getting the first 5 users by points
            var temp = getTop5('points'),
                top = [],
                i;
 // Adding usernames and points to the array
            for (i in temp) {
                top.push((parseInt(i) + 1) + '. ' + $.resolveRank(temp[i].username) + ' ' + $.getPointsString(temp[i].value));
            }
// Display a list of top users by points
            $.say($.lang.get('top5.default', amountPoints, $.pointNameMultiple, top.join(', ')));
            return;
        }

        /*
         * @commandpath toptime - Display the top people with the most time
         
         */
        if (command.equalsIgnoreCase('toptime')) {
            var temp = getTop5('time'),
                top = [],
                i;
//Adding usernames and time to the array
            for (i in temp) {
                top.push((parseInt(i) + 1) + '. ' + $.resolveRank(temp[i].username) + ' ' + $.getTimeString(temp[i].value, true));
            }
//Display a list of top users by time
            $.say($.lang.get('top5.default', amountTime, 'time', top.join(', ')));
            return;
        }

        /*
         * @commandpath topamount - Set how many people who will show up in the !top points list
         
         */
        if (command.equalsIgnoreCase('topamount')) {
            if (action === undefined) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.points.usage'));
                return;
            } else if (action > 15) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.max'));
                return;
            }

            amountPoints = action;
            $.inidb.set('settings', 'topListAmountPoints', amountPoints);
            $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.points.set', amountPoints));
        }

        /*
         * @commandpath toptimeamount - Set how many people who will show up in the !toptime list
         
         */
        if (command.equalsIgnoreCase('toptimeamount')) {
            if (action === undefined) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.time.usage'));
                return;
            } else if (action > 15) {
                $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.max'));
                return;
            }

            amountTime = action;
            $.inidb.set('settings', 'topListAmountTime', amountTime);
            $.say($.whisperPrefix(sender) + $.lang.get('top5.amount.time.set', amountTime));
        }

        /*
         * @commandpath reloadtopbots - DEPRECATED. Use !reloadbots - устарело
         */
        if (command.equalsIgnoreCase('reloadtopbots')) {
            $.say($.whisperPrefix(sender) + $.lang.get('top5.reloadtopbots'));
        }

        /*
         * Panel command, no command path needed. - Call the reload function if the user writes to the chat reloadtop
         */
        if (command.equalsIgnoreCase('reloadtop')) {
            reloadTop();
        }
    });

    /**
     * @event initReady
       Registering a command in the chat and sending it to the command handler
       The main block contains the command handler for keywords in the chat. 
       If the user enters top into the chat, the system will refer to the stream points module, if available, and display the first five users, if any. 
       The block includes displaying the first 5 users by points and time, determining the number of people who will be shown in the chat.
     */
    $.bind('initReady', function() {
        $.registerChatCommand('./commands/topCommand.js', 'top', 7);
        $.registerChatCommand('./commands/topCommand.js', 'toptime', 7);
        $.registerChatCommand('./commands/topCommand.js', 'topamount', 1);
        $.registerChatCommand('./commands/topCommand.js', 'toptimeamount', 1);
        $.registerChatCommand('./commands/topCommand.js', 'reloadtop', 1);
        $.registerChatCommand('./commands/topCommand.js', 'reloadtopbots', 1);
    });
})();
