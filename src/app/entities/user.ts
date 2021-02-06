export const PASSWORD_WILDCARD = 'cRW=kbPN';

export class User {
    private _email: string;
    private _name: string;
    private _surname: string;
    private _password: string;
    private _gender: string;
    private _birthdate: Date;
    private _educationLevel: string;
    private _registrySource: string;
    private _country: string;
    private _department: string;
    private _municipality: string;
    private _phone: string;
    private _username: string;
    private _termsConditions: boolean;

    static parseFromApi(json: any): User {
        const user: User = new User();
        user._email = json.email;
        user._name = json.nombre;
        user._surname = json.apellido;
        user._gender = json.nombreGenero == null ? null : json.nombreGenero;
        user._birthdate =
            json.fechaNacimiento == null
                ? null
                : new Date(json.fechaNacimiento);
        user._educationLevel = json.nombreNivelEducativo;
        user._registrySource = json.nombreFuenteRegistro;
        if (json.nombreMunicipio !== '') {
            const territories: string[] = json.nombreMunicipio.split(';');
            user._country = territories[0];
            user._department = territories[1];
            user._municipality = territories[2];
        }
        user._phone = json.celular;
        user._termsConditions = json.terminosCondiciones;
        user._username = json.username;
        return user;
    }

    static parseFromFacebook(json: any): User {
        const user: User = new User();
        user.name = json.first_name;
        user.surname = json.last_name;
        user.email = json.email === undefined ? json.id : json.email;
        user._username = json.email === undefined ? json.id : json.email;
        return user;
    }

    static parseFromGoogle(json: any): User {
        const user: User = new User();
        user.name = json.givenName;
        user.surname = json.familyName;
        user.email = json.email;
        user._username = json.email;
        return user;
    }

    constructor() {}

    get email(): string {
        return this._email;
    }

    set email(email: string) {
        this._email = email;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get surname(): string {
        return this._surname;
    }

    set surname(surname: string) {
        this._surname = surname;
    }

    get password(): string {
        return this._password;
    }

    set password(password: string) {
        this._password = password;
    }

    get gender(): string {
        return this._gender;
    }

    set gender(gender: string) {
        this._gender = gender;
    }

    get birthdate(): Date {
        return this._birthdate;
    }

    set birthdate(birthdate: Date) {
        this._birthdate = birthdate;
    }

    get educationLevel(): string {
        return this._educationLevel;
    }

    set educationLevel(educationLevel: string) {
        this._educationLevel = educationLevel;
    }

    get registrySource(): string {
        return this._registrySource;
    }

    set registrySource(registrySource: string) {
        this._registrySource = registrySource;
    }

    get country(): string {
        return this._country;
    }

    set country(country: string) {
        this._country = country;
    }

    get department(): string {
        return this._department;
    }

    set department(department: string) {
        this._department = department;
    }

    get municipality(): string {
        return this._municipality;
    }

    set municipality(municipality: string) {
        this._municipality = municipality;
    }

    get phone(): string {
        return this._phone;
    }

    set phone(phone: string) {
        this._phone = phone;
    }

    get username(): string {
        return this._username;
    }

    set username(username: string) {
        this._username = username;
    }

    get termsConditions(): boolean {
        return this._termsConditions;
    }

    set termsConditions(termsConditions: boolean) {
        this._termsConditions = termsConditions;
    }

    isValid(): boolean {
        return this.email != null && this.password != null;
    }

    concatTerritories(): string {
        let result = '';
        if (
            this.country !== undefined &&
            this.department !== undefined &&
            this.municipality !== undefined
        ) {
            result =
                this.country + ';' + this.department + ';' + this.municipality;
        }
        return result;
    }

    toJsonObject(): any {
        return {
            nombre: (this.name) ? this.name : '',
            apellido: (this.surname) ? this.surname : '',
            email: this.email,
            nombreFuenteRegistro: this.registrySource,
            contrasena: this.password,
            username: this.username,
            terminosCondiciones: this.termsConditions,
            celular: this.phone,
        };
    }

    updateJsonObject(): any {
        return {
            email: this.email,
            nombreFuenteRegistro: this.registrySource,
            contrasena: this.password,
            username: this._username,
            celular: this.phone,
            nombre: this.name,
            apellido: this.surname,
            fechaNacimiento: this.birthdate,
            nombreGenero: this.gender,
            nombreNivelEducativo: this.educationLevel,
            nombreMunicipio: this.country + ';' + this.department + ';' + this.municipality,
        };
    }

}
