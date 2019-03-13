import { 
    MethodDecorator, 
    TypeDescription, 
    td, 
    TypeDescriptionTarget,
    optional,
    isInteger,
    ClassDecorator,
    PropertyDecorator,
    AccessorDecorator,
    ParameterDecorator
} from "../lib";

export const ruslan = {
    prop: 'Ruslan',
    enum: 43
};

export const RuslanTD: TypeDescription<typeof ruslan> = {
    prop: 'string',
    enum: suspect => (
        typeof suspect === 'number' && [58, 4, 43].includes(suspect)
    )
};

export const UserTD = td({
    id: 'number',
    login: optional('string'),
    fullname: 'string',
    registeredAt: (sus): sus is Date => sus instanceof Date,
    avaUrl: 'string',
    isDisabled: 'boolean',
});

export const user: TypeDescriptionTarget<typeof UserTD> = {
    avaUrl: 'asdads',
    fullname: 'sadasd',
    id: 232,
    isDisabled: false,
    registeredAt: new Date
};

export const JsonUserTD = td({
    name:     /[a-zA-Z]{3,32}/,
    password: /[a-zA-Z]{3,32}/,
    email:    (_suspect): _suspect is string => {
        // instert custom logic to check that suspect is an email string here
        return true;
    },
    cash:       isInteger,
    isDisabled: 'boolean'
});

export type JsonUser = TypeDescriptionTarget<typeof JsonUserTD>;

function methodDecorator(): MethodDecorator<[number, boolean], boolean> {
    return () => {};
}

function classDecorator(): ClassDecorator {
    return (cls) => {
        return cls;
    };
}

function propertyDecorator(): PropertyDecorator<number> {
    return () => {};
}

function accessorDecorator(): AccessorDecorator<number> {
    return () => {};
}

function parameterDecorator(): ParameterDecorator<number> {
    return () => {};
}

@classDecorator()
export class Cl {

    @propertyDecorator()
    prop!: number;


    @accessorDecorator()
    get val() {
        return 22;
    }

    @methodDecorator()
    // tslint:disable-next-line: prefer-function-over-method
    method(
        _str: number, 
        @parameterDecorator()
        _bool: boolean
    ) {
        return true;
    }
}



