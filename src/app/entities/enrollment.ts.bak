import { User } from './user';
import { Country } from './country';
import { Department } from './department';
import { Municipality } from './municipality';

export class Enrollment {

    private _user: User;
    private _registrySource: string;
    private _country: Country;
    private _department: Department;
    private _municipality: Municipality;

    constructor(user: User, registrySource: string, country?: Country, department?: Department, municipality?: Municipality) {
        this._user = user;
        this._registrySource = registrySource;
        this._country = country;
        this._department = department;
        this._municipality = municipality;
    }

    get user(): User { return this._user; }

    set user(user: User) { this._user = user; }

    get registrySource(): string { return this._registrySource; }

    set registrySource(registrySource: string) { this._registrySource = registrySource; }

    get country(): Country { return this._country; }

    set country(country: Country) { this._country = country; }

    get department(): Department { return this._department; }

    set department(department: Department) { this._department = department; }

    get municipality(): Municipality { return this._municipality; }

    set municipality(municipality: Municipality) { this._municipality = municipality; }

    concatTerritories(): string {
        let result: string = '';
        if (this.country != undefined
            && this.department != undefined
            && this.municipality != undefined) 
        {
            result = this.country.name + ',' + this.department.name + ',' + this.municipality.name;
        }
        return result;
    }

    isValid(): boolean {
        return this.user.isValid() 
            && (this.registrySource != null);
    }

    toJsonObjectLogin(): any {
        return {
            username: this.user.email
          , nombreFuenteRegistro: this.registrySource
          , contrasena: this.user.password
        };
    }

    toJsonObject(): any {
        return {
              username: this.user.email
            , nombreFuenteRegistro: this.registrySource
            , contrasena: this.user.password
            , nombre: (this.user.name == undefined) ? '' : this.user.name
            , apellido: (this.user.surname == undefined) ? '' : this.user.surname
            , fechaNacimiento: (this.user.birthdate == undefined) ? '' : this.user.birthdate.toISOString()
            , nombreMunicipio: this.concatTerritories()
            , nombreGenero: (this.user.gender == undefined) ? '' : this.user.gender
            , nombreNivelEducativo: (this.user.educationLevel == undefined) ? '' : this.user.educationLevel
        };
    }

    /*
    static fromJsonObject(object: any): Enrollment {
        let user: User = User.fromJsonObject(object);
        let enrollment: Enrollment = new Enrollment(user, object.nombreFuenteRegistro);
        let territories: string[] = object.nombreMunicipio.split(',');

        enrollment.country = new Country (territories[0]

    } */
}