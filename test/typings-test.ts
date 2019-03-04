import { TypeDescription, td, TypeDescriptionTarget, optional } from "../lib";

const ruslan = {
    prop: 'Ruslan',
    enum: 43
};

const RuslanTD: TypeDescription<typeof ruslan> = {
    prop: 'string',
    enum: suspect => (
        typeof suspect === 'number' && [58, 4, 43].includes(suspect)
    )
};

const UserTD = td({
    id: 'number',
    login: optional('string'),
    fullname: 'string',
    registeredAt: (sus): sus is Date => sus instanceof Date,
    avaUrl: 'string',
    isDisabled: 'boolean',
});

const user: TypeDescriptionTarget<typeof UserTD> = {
    avaUrl: 'asdads',
    fullname: 'sadasd',
    id: 232,
    isDisabled: false,
    registeredAt: new Date
};

if (user || RuslanTD) {}