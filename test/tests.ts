import { describe, it }  from 'mocha';
import { assert }        from 'chai';
import { conforms, TypeDescription  } from '../index';
describe('conforms', () => {
    it('should work as typeof when being forwarded a primitive type name as type description', () => {
        // tslint:disable-next-line no-magic-numbers
        assert.isTrue(conforms(23, 'number'));
        assert.isTrue(conforms(true, 'boolean'));
        assert.isTrue(conforms(false, 'boolean'));
        assert.isTrue(conforms(null, 'object'));
        assert.isTrue(conforms(undefined, 'undefined'));
        assert.isTrue(conforms(() => {
        }, 'function'));
        assert.isTrue(conforms({prop: null}, 'object'));
        assert.isTrue(conforms(Symbol(), 'symbol'));
    });

    it('should work with objects as type descriptions', () => {
        assert.isTrue(conforms({prop: 'lala'}, {prop: 'string'}));
        assert.isTrue(conforms(
            {
                prop: 'lala',
                prop2: true,
                obj: {
                    obj: [23, 43]
                },
                someExcessProperty: null
            },
            {
                prop: 'string',
                prop2: 'boolean',
                obj: {
                    obj: ['number', 'number']
                }
            }));
    });
    it('should recognize one-item TD array as a random length array', () => {
        assert.isTrue(conforms(
            [{id: 22}, {id: 75}, {id: 55}],
            [{id: 'number'}]
        ));
        assert.isTrue(conforms(
            [],
            [{id: 'number'}]
        ));
        assert.isTrue(conforms(
            [{id: 22}],
            [{id: 'number'}]
        ));
    });
    it('should work with arrays as type descriptions', () => {
        assert.isTrue(conforms(
            // tslint:disable-next-line no-magic-numbers
            [true, null, 22, 'str'],
            ['boolean', 'object', 'number', 'string']
        ));
    });

    it('should take empty arrays and empty objects apart', () => {
        assert.isTrue(conforms([], ['string']));
        assert.isTrue(conforms({}, {}));
        assert.isFalse(conforms({}, [{objects: 'number'}]));
        assert.isFalse(conforms([], {}));
    });
    it('should try to match each TD in a Set', () => {
        assert.isTrue(conforms(
            // tslint:disable-next-line no-magic-numbers
            42, new Set<TypeDescription>(
                [{obj: 'number'}, 'string', 'number', ['boolean']]
            )
        ));
        assert.isFalse(conforms(
            {}, new Set<TypeDescription>(
                [{obj: 'number'}, 'string', 'number', ['boolean']]
            )
        ));

    });
    it('should use given predicate to validate the suspect', () => {
        // tslint:disable-next-line no-magic-numbers
        assert.isTrue(conforms(23, suspect => suspect === 23));
        assert.isTrue(conforms('str', suspect => suspect === 'str'));
        assert.isTrue(conforms({
            prop: 'Ruslan',
            enum: 43
        }, {
            prop: 'string',
            // tslint:disable-next-line no-magic-numbers
            enum: suspect => typeof suspect === 'number' && [58, 4, 43].includes(suspect)
        }));
        assert.isFalse(conforms(true, () => false));
        assert.isFalse(conforms({}, {
            id: 'number',
            login: 'string',
            fullname: 'string',
            registeredAt: _suspect => true,
            avaUrl: 'string',
            isDisabled: 'boolean',
        }));
    });
});
