const CONFIG_MACRO = {
  actorName: game.user.name,
  actionTitle: "Atak bronią główną",
};

// ============= OBIERANIE TARGETU ============== //

let targets = []
game.user.targets.forEach(i => {
    const name = i.name;
    targets.push(name);
})

if (targets.length === 0)
{
  ui.notifications.info("Wpierw wybierz target");
  return;
}

// =============== SPRAWDŹ CZY TARGET JEST WYBRANY ============= //

const targetToken = Array.from(game.user.targets)[0];
if (!targetToken) return ui.notifications.info("Najpierw wybierz target (T).");

// ============== WYBIERANIE AKTORA USERA ================= //

const user = game.actors.find(a => a.name === CONFIG_MACRO.actorName);

const dominantHand = user.system.handed;
const heldItemId = user.system.hands[dominantHand]?.id;
if(!heldItemId)
{
    return ui.notifications.error(`Załóż przedmiot do dominującej ręki - ${dominantHand}.`);
}

const item = user.items.get(heldItemId);
if(!item)
{
    return ui.notifications.error(`Nie znaleziono przedmiotu w ręce - ${dominantHand}.`);
}

if(!item.system.hasAmmo())
{
   return ui.notifications.error(`Nie możesz strzelić z ${item.name} bo nie jest przeładowany`);
}

await user.setupWeaponTest(heldItemId);