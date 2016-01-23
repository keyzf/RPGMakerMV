//=============================================================================
// MessageSelectPicture.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2016/01/23 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 選択肢のピクチャ表示プラグイン
 * @author トリアコンタン
 *
 * @help 選択肢とピクチャ番号を紐付けます。
 * あらかじめ不透明度0でピクチャを表示したうえで
 * プラグインコマンドを実行することで、対象の選択肢にカーソルを合わせたときだけ
 * 不透明度を255に変更するようにします。
 *
 * 選択肢を決定後、プラグイン側でピクチャを非表示にすることはないので
 * 自由にイベントコマンドで操作してください。
 *
 * プラグインコマンド詳細
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 *
 * 選択肢ピクチャ設定 or
 * MSP_SET [ピクチャ番号] [選択肢#(1-6)]
 * 　選択肢の番号と表示するピクチャ番号とを関連づけます。
 * 　関連づけは、選択肢を決定した時点で解除されます。
 *
 * 例：選択肢ピクチャ設定 1 1
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function () {
    'use strict';

    var getArgNumber = function (arg, min, max) {
        if (arguments.length <= 2) min = -Infinity;
        if (arguments.length <= 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var window = SceneManager._scene._windowLayer.children[0];
        return window ? window.convertEscapeCharacters(text) : text;
    };

    var getCommandName = function (command) {
        return (command || '').toUpperCase();
    };

    if (!Object.prototype.hasOwnProperty('iterate')) {
        Object.defineProperty(Object.prototype, 'iterate', {
            value : function (handler) {
                Object.keys(this).forEach(function (key, index) {
                    handler.call(this, key, this[key], index);
                }, this);
            }
        });
    }

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        try {
            this.pluginCommandMessageSelectPicture(command, args);
        } catch (e) {
            if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
                var window = require('nw.gui').Window.get();
                if (!window.isDevToolsOpen()) {
                    var devTool = window.showDevTools();
                    devTool.moveTo(0, 0);
                    devTool.resizeTo(Graphics.width, Graphics.height);
                    window.focus();
                }
            }
            console.log('プラグインコマンドの実行中にエラーが発生しました。');
            console.log('- コマンド名 　: ' + command);
            console.log('- コマンド引数 : ' + args);
            console.log('- エラー原因   : ' + e.toString());
        }
    };

    Game_Interpreter.prototype.pluginCommandMessageSelectPicture = function (command, args) {
        switch (getCommandName(command)) {
            case '選択肢ピクチャ設定' :
            case 'MSP_SET':
                $gameMessage.setSelectPictureId(getArgNumber(args[0], 1), getArgNumber(args[1]), 1);
                break;
        }
    };

    var _Game_Message_initialize = Game_Message.prototype.initialize;
    Game_Message.prototype.initialize = function() {
        _Game_Message_initialize.apply(this, arguments);
        this.clearSkipInfo();
        this.clearSelectPictures();
    };

    Game_Message.prototype.setSelectPictureId = function(index, pictureId) {
        this._selectPictures[index] = pictureId;
    };

    Game_Message.prototype.clearSelectPictures = function() {
        this._selectPictures = [];
    };

    Game_Message.prototype.getSelectPictures = function() {
        return this._selectPictures;
    };

    var _Game_Message_onChoice = Game_Message.prototype.onChoice;
    Game_Message.prototype.onChoice = function(n) {
        _Game_Message_onChoice.apply(this, arguments);
        this.clearSelectPictures();
    };

    Game_Picture.prototype.setOpacity = function(value) {
        this._opacity = value;
    };

    var _Window_ChoiceList_cursorUp = Window_ChoiceList.prototype.cursorUp;
    Window_ChoiceList.prototype.cursorUp = function() {
        _Window_ChoiceList_cursorUp.apply(this, arguments);
        this.updateSelectPicture();
    };

    var _Window_ChoiceList_cursorDown = Window_ChoiceList.prototype.cursorDown;
    Window_ChoiceList.prototype.cursorDown = function(wrap) {
        _Window_ChoiceList_cursorDown.apply(this, arguments);
        this.updateSelectPicture();
    };

    var _Window_ChoiceList_selectDefault = Window_ChoiceList.prototype.selectDefault;
    Window_ChoiceList.prototype.selectDefault = function() {
        _Window_ChoiceList_selectDefault.apply(this, arguments);
        this.updateSelectPicture();
    };

    Window_ChoiceList.prototype.updateSelectPicture = function() {
        $gameMessage.getSelectPictures().iterate(function(key, id, index) {
            var picture = $gameScreen.picture(id);
            if (picture) picture.setOpacity(index === this.index() ? 255 : 0);
        }.bind(this));
    };
})();
