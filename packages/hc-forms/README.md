# Hélium Connect Forms

![NPM Version](https://img.shields.io/npm/v/%40net-helium%2Fhc-forms)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/NetHelium/js-libs/blob/main/LICENSE)

Cette librairie permet d'intégrer facilement des formulaires [Hélium Connect](https://helium-connect.fr) sur vos pages web.

## Le problème résolu par cette librairie

En faisant l'intégration vous-même, vous êtes amené à utiliser un code HTML similaire à celui-ci :

```html
<iframe title="Mon formulaire" src="URL_FORMULAIRE"></iframe>
```

Le problème est qu'il est impossible pour une `<iframe>` d'ajuster sa hauteur automatiquement en fonction du contenu du formulaire.
Vous pouvez bien-sûr renseigner une hauteur fixe à l'iframe mais la hauteur d'un formulaire peut varier en fonction de plusieurs facteurs :

- La page de confirmation du formulaire a une hauteur différente de la page des questions
- Le formulaire est de type bloc par bloc ou question par question (les blocs et/ou questions auront des hauteurs différentes)
- Le formulaire ajoute ou supprime des questions en fonction des réponses aux questions précédentes (affichage conditionnel)
- L'utilisateur redimensionne la fenêtre de son navigateur

Si l'iframe est plus haute que nécessaire, il y aura un espace vide en dessous du formulaire. Si l'iframe n'est pas assez haute, une barre de scroll apparaitra.\
Cette librairie génère une iframe pour chacun de vos formulaires et gère automatiquement sa hauteur en fonction des changements qui ont lieu dans le formulaire.

## Installation

### Chargement local à votre projet

Pour installer la librairie localement sur votre projet (installation de **Node JS** et présence d'un **package.json** requis dans votre projet), utilisez l'une des commandes suivantes en fonction du package manager utilisé par votre projet :

```bash
# npm
npm install @net-helium/hc-forms

# pnpm
pnpm add @net-helium/hc-forms

# yarn
yarn add @net-helium/hc-forms
```

Intégrez une balise `<script>` sur vos pages qui pointe sur le fichier **/dist/hc-forms.min.js** du package.\
Le chemin dépend de la gestion des assets sur votre site.
Suivant les technologies et framework utilisés pour le développement de votre site, cette gestion sera différente.

```html
<script src="/chemin-vers/dist/hc-forms.min.js" defer></script>
```

### Chargement depuis un CDN

Si vous préférez charger la librairie depuis un CDN, intégrez l'une des balises `<script>` ci-dessous sur vos pages :

```html
<!-- Lien vers la dernière version -->
<script src="https://cdn.jsdelivr.net/npm/@net-helium/hc-forms/dist/hc-forms.min.js" defer></script>

<!-- Lien vers une version spécifique (exemple avec la version 1.0.0) -->
<script src="https://cdn.jsdelivr.net/npm/@net-helium/hc-forms@1.0.0/dist/hc-forms.min.js" defer></script>
```

## Usage

Pour afficher un formulaire Hélium Connect, utilisez le code HTML suivant (remplacez **URL_FORMULAIRE**) :

```html
<hc-form url="URL_FORMULAIRE"></hc-form>
```

Ce code génère une iframe contenant le formulaire avec une largeur de 100% par rapport à son conteneur (l'élément parent de `<hc-form>`) et une hauteur calculée automatiquement en fonction du contenu du formulaire.\
La hauteur de l'iframe sera modifiée automatiquement si le contenu du formulaire change ou si la fenêtre du navigateur est redimensionnée.

### Problème sur le calcul de la hauteur

Si la hauteur n'est pas calculée correctement (une barre de scroll est visible), il est très probable qu'il s'agisse d'un problème de style dans le formulaire qui empêche de calculer la bonne hauteur correctement.\
Si la correction de ce problème ne peut pas être faite tout de suite, vous avez la possibilité de compenser comme ceci :

```html
<hc-form url="URL_FORMULAIRE" padding-bottom="15"></hc-form>
```

Dans cet exemple, la librairie ajoutera 15 pixels supplémentaires à chaque hauteur calculée. Cette option est une solution de secours en attendant une correction dans le formulaire plutôt qu'une solution définitive, il est fortement recommandé corriger le style du formulaire sur le long terme.\
Si le gabarit de votre formulaire a été réalisé par Net Hélium, remontez-nous le problème.

Si non renseignée, la valeur par défaut de `padding-bottom` est 0.

### Élément fixe en haut de page

Lorsqu'il y a un changement de page dans le formulaire (arrivée sur la page de confirmation ou changement de page de questions par exemple), la librairie déclenche un scroll automatique sur votre page web en haut de l'iframe afin de placer l'internaute au début de la nouvelle page du formulaire.

Si vous avez un élément fixe en haut de votre page (typiquement un menu fixe  qui reste visible à tout moment), il passera par dessus le début du formulaire. Pour éviter ce problème, vous pouvez utiliser le code suivant :

```html
<hc-form url="URL_FORMULAIRE" scroll-offset="50"></hc-form>
```

Ce code indique à la librairie de décaler son scroll de 50 pixels par rapport au haut de la page.

À titre d'exemple, si on imagine que votre menu fixe fait 30 pixels de haut et que vous voulez un espace de 15 pixels entre le menu et le haut du formulaire après un scroll automatique réalisé par la librairie, la valeur de `scroll-offset` à renseigner est 45.

Si non renseignée, la valeur par défaut de `scroll-offset` est 0.

### Modification dynamique

Il est possible de modifier dynamiquement les valeurs des attributs en JavaScript et elles seront prises en compte instantanément.

`<hc-form>` est une balise HTML comme une autre, il est donc possible de lui attribuer un `id` ou une `class` pour sélectionner le(s) formulaire(s) qui vous intéresse en CSS ou en JavaScript.
Chaque attribut est mappé sur une propriété JavaScript correspondante :

```javascript
// Récupération d'un <hc-form> avec un id `contact`
const contactForm = document.querySelector("hc-form#contact");

// Modification des propriétés
contactForm.url = "URL_AUTRE_FORMULAIRE";
contactForm.paddingBottom = 15;
contactForm.scrollOffset = 50;
```

### Personnalisation du style

Les balises `<hc-form>` peuvent être stylées comme n'importe quelle autre balise HTML :

```css
/* Bordure bleue sur tous les <hc-form> ayant la classe `blue-border` */
hc-form.blue-border {
  border: 2px solid #0099cc;
}
```

Si vous voulez modifier le style de l'iframe encapsulée dans un `<hc-form>` ou du message d'erreur en cas d'URL non valide :

```css
/* Bordure bleue sur l'iframe de tous les <hc-form> ayant une classe `blue` */
hc-form.blue::part(iframe) {
  border: 2px solid #0099cc;
}

/* Alignement à droite du message d'erreur du <hc-form> ayant un id `contact` */
hc-form#contact::part(error-msg) {
  text-align: right;
}
```

La librairie définie des variables CSS avec des valeurs par défaut pour certaines règles CSS du message d'erreur (`font-family`, `font-size` et `color`) :

```css
--hc-forms-error-font-family: Verdana, Arial, sans-serif;
--hc-forms-error-font-size: 1rem;
--hc-forms-error-color: #ff0000;
```

Vous pouvez modifier les valeurs pour ces règles en changeant les valeurs de ces variables :

```css
/* Le message d'erreur de tous les <hc-form> aura une `font-size` de 2rem */
hc-form {
  --hc-forms-error-font-size: 2rem;
}

/* Le message d'erreur sera vert pour les <hc-form> ayant une classe `green-error` */
hc-form.green-error {
  --hc-forms-error-color: #4bd116;
}
```

Les styles par défaut de l'iframe sont les suivants :

```css
border: none;
width: 100%;
```

Les styles par défaut du message d'erreur sont les suivants :

```css
text-align: center;
font-family: var(--hc-forms-error-font-family, Verdana, Arial, sans-serif);
font-size: var(--hc-forms-error-font-size, 1rem);
color: var(--hc-forms-error-color, #ff0000);
```

## Licence

Cette librairie est mise à disposition sous licence [MIT](https://github.com/NetHelium/js-libs/blob/main/LICENSE).
