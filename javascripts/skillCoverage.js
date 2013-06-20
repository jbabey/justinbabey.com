var SkillViewModel = function (skill) {
    var self = this;

    if (!(self instanceof SkillViewModel)) {
        return new SkillViewModel(skill);
    }

    skill = skill || {};

    self.name = ko.observable(skill.name || '');
    self.player = ko.observable(skill.player || 'None');
    self.score = ko.observable(skill.score || 0);
    self.trained = ko.observable(skill.score || false);
    self.claimed = ko.computed(function () {
        return self.player() !== 'None';
    });
};

var SkillsViewModel = function (skills) {
    var self = this;

    if (!(self instanceof SkillsViewModel)) {
        return new SkillsViewModel(skills);
    }

    self.skills = ko.observableArray(skills);
};

ko.applyBindings(new SkillsViewModel([
    new SkillViewModel({ name: 'Acrobatics' }),
    new SkillViewModel({ name: 'Arcana' }),
    new SkillViewModel({ name: 'Athletics' }),
    new SkillViewModel({ name: 'Bluff' }),
    new SkillViewModel({ name: 'Diplomacy' }),
    new SkillViewModel({ name: 'Dungeoneering' }),
    new SkillViewModel({ name: 'Endurance' }),
    new SkillViewModel({ name: 'Heal' }),
    new SkillViewModel({ name: 'History' }),
    new SkillViewModel({ name: 'Insight' }),
    new SkillViewModel({ name: 'Intimidate' }),
    new SkillViewModel({ name: 'Leadership' }),
    new SkillViewModel({ name: 'Nature' }),
    new SkillViewModel({ name: 'Perception' }),
    new SkillViewModel({ name: 'Religion' }),
    new SkillViewModel({ name: 'Stealth' }),
    new SkillViewModel({ name: 'Streetwise' }),
    new SkillViewModel({ name: 'Thievery' }),
    new SkillViewModel({ name: 'Tinkering' })
]));