import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface FuelData {
  id: string;
  name: string;
  state: 'Solid' | 'Liquid' | 'Gaseous';
  ncv: number; // TJ/Gg
  density?: number; // kg/L or kg/m³
  renewability: 'Renewable' | 'Non-renewable';
}

const FUEL_DATABASE: FuelData[] = [
  { id: 'anthracite', name: 'Anthracite', state: 'Solid', ncv: 26.70, renewability: 'Non-renewable' },
  { id: 'aviation-gasoline', name: 'Aviation gasoline', state: 'Liquid', ncv: 44.30, density: 0.71, renewability: 'Non-renewable' },
  { id: 'biodiesel', name: 'Biodiesel', state: 'Liquid', ncv: 27.00, density: 0.85, renewability: 'Renewable' },
  { id: 'biogasoline', name: 'Biogasoline', state: 'Liquid', ncv: 27.00, density: 0.75, renewability: 'Renewable' },
  { id: 'bitumen', name: 'Bitumen', state: 'Liquid', ncv: 40.20, density: 1.03, renewability: 'Non-renewable' },
  { id: 'blast-furnace-gas', name: 'Blast furnace gas', state: 'Gaseous', ncv: 2.47, density: 1.25, renewability: 'Non-renewable' },
  { id: 'brown-coal-briquettes', name: 'Brown coal briquettes', state: 'Solid', ncv: 20.70, renewability: 'Non-renewable' },
  { id: 'butane', name: 'Butane and isomers', state: 'Gaseous', ncv: 45.57, density: 2.50, renewability: 'Non-renewable' },
  { id: 'coke-oven-coke', name: 'Coke oven coke & lignite coke', state: 'Solid', ncv: 28.20, renewability: 'Non-renewable' },
  { id: 'coke-oven-gas', name: 'Coke oven gas', state: 'Gaseous', ncv: 38.70, density: 0.48, renewability: 'Non-renewable' },
  { id: 'coking-coal', name: 'Coking coal', state: 'Solid', ncv: 28.20, renewability: 'Non-renewable' },
  { id: 'crude-oil', name: 'Crude oil and distillates', state: 'Liquid', ncv: 42.30, density: 0.80, renewability: 'Non-renewable' },
  { id: 'ethane', name: 'Ethane', state: 'Gaseous', ncv: 46.40, density: 1.30, renewability: 'Non-renewable' },
  { id: 'gas-coke', name: 'Gas coke', state: 'Gaseous', ncv: 28.20, density: 0.54, renewability: 'Non-renewable' },
  { id: 'diesel-oil', name: 'Gas/Diesel oil', state: 'Liquid', ncv: 43.00, density: 0.84, renewability: 'Non-renewable' },
  { id: 'jet-gasoline', name: 'Jet gasoline', state: 'Liquid', ncv: 44.30, density: 0.81, renewability: 'Non-renewable' },
  { id: 'jet-kerosene', name: 'Jet kerosene', state: 'Liquid', ncv: 44.10, density: 0.79, renewability: 'Non-renewable' },
  { id: 'kerosene', name: 'Kerosene', state: 'Liquid', ncv: 43.80, density: 0.80, renewability: 'Non-renewable' },
  { id: 'landfill-gas', name: 'Landfill gas', state: 'Gaseous', ncv: 50.40, density: 0.90, renewability: 'Renewable' },
  { id: 'lignite', name: 'Lignite', state: 'Solid', ncv: 11.90, renewability: 'Non-renewable' },
  { id: 'lpg', name: 'Liquefied Petroleum Gases (LPG)', state: 'Liquid', ncv: 47.30, density: 0.54, renewability: 'Non-renewable' },
  { id: 'lubricants', name: 'Lubricants', state: 'Liquid', ncv: 40.20, density: 1.00, renewability: 'Non-renewable' },
  { id: 'methane', name: 'Methane', state: 'Gaseous', ncv: 50.00, density: 0.67, renewability: 'Non-renewable' },
  { id: 'motor-gasoline', name: 'Motor gasoline/Petrol', state: 'Liquid', ncv: 44.30, density: 0.74, renewability: 'Non-renewable' },
  { id: 'municipal-biomass', name: 'Municipal wastes (biomass fraction)', state: 'Solid', ncv: 11.60, renewability: 'Renewable' },
  { id: 'municipal-non-biomass', name: 'Municipal wastes (non-biomass fraction)', state: 'Solid', ncv: 10.00, renewability: 'Non-renewable' },
  { id: 'naphtha', name: 'Naphtha', state: 'Liquid', ncv: 44.50, density: 0.77, renewability: 'Non-renewable' },
  { id: 'natural-gas', name: 'Natural gas', state: 'Gaseous', ncv: 48.00, density: 0.70, renewability: 'Non-renewable' },
  { id: 'natural-gas-liquids', name: 'Natural gas liquids (NGL)', state: 'Liquid', ncv: 44.20, density: 0.47, renewability: 'Non-renewable' },
  { id: 'oil-shale', name: 'Oil shale and tar sands', state: 'Liquid', ncv: 8.90, density: 0.95, renewability: 'Non-renewable' },
  { id: 'orimulsion', name: 'Orimulsion', state: 'Liquid', ncv: 27.50, density: 1.13, renewability: 'Non-renewable' },
  { id: 'oxygen-steel-gas', name: 'Oxygen steel furnace gas', state: 'Gaseous', ncv: 7.06, density: 1.33, renewability: 'Non-renewable' },
  { id: 'paraffin-waxes', name: 'Paraffin waxes', state: 'Solid', ncv: 40.20, renewability: 'Non-renewable' },
  { id: 'patent-fuel', name: 'Patent fuel', state: 'Solid', ncv: 20.70, renewability: 'Non-renewable' },
  { id: 'peat', name: 'Peat', state: 'Solid', ncv: 9.76, renewability: 'Non-renewable' },
  { id: 'petroleum-coke', name: 'Petroleum coke', state: 'Solid', ncv: 32.50, renewability: 'Non-renewable' },
  { id: 'propane', name: 'Propane', state: 'Gaseous', ncv: 46.32, density: 1.90, renewability: 'Non-renewable' },
  { id: 'refinery-feedstocks', name: 'Refinery feedstocks', state: 'Liquid', ncv: 43.00, density: 0.83, renewability: 'Non-renewable' },
  { id: 'refinery-gas', name: 'Refinery Gas', state: 'Gaseous', ncv: 49.50, density: 0.88, renewability: 'Non-renewable' },
  { id: 'residual-fuel-oil', name: 'Residual fuel oil', state: 'Liquid', ncv: 40.40, density: 0.94, renewability: 'Non-renewable' },
  { id: 'shale-oil', name: 'Shale oil (liquid)', state: 'Liquid', ncv: 38.10, density: 1.00, renewability: 'Non-renewable' },
  { id: 'sludge-gas', name: 'Sludge gas', state: 'Gaseous', ncv: 50.40, density: 0.67, renewability: 'Renewable' },
  { id: 'sub-bituminous-coal', name: 'Sub-bituminous coal', state: 'Solid', ncv: 18.90, renewability: 'Non-renewable' },
  { id: 'sulphite-lyes', name: 'Sulphite lyes (black liquor)', state: 'Liquid', ncv: 11.80, density: 1.20, renewability: 'Renewable' },
  { id: 'turpentine', name: 'Turpentine', state: 'Liquid', ncv: 44.40, density: 0.87, renewability: 'Renewable' },
  { id: 'vegetable-oils', name: 'Vegetable oils', state: 'Liquid', ncv: 37.80, density: 0.90, renewability: 'Non-renewable' },
  { id: 'waste-oils', name: 'Waste oils', state: 'Liquid', ncv: 40.20, density: 0.80, renewability: 'Non-renewable' },
  { id: 'waste-water-biogas', name: 'Waste water treatment biogas', state: 'Gaseous', ncv: 35.00, density: 0.90, renewability: 'Renewable' },
  { id: 'white-spirit', name: 'White Spirit & SBP', state: 'Liquid', ncv: 40.20, density: 0.75, renewability: 'Non-renewable' },
  { id: 'wood-waste', name: 'Wood/Wood waste', state: 'Solid', ncv: 15.60, renewability: 'Renewable' }
];

interface FuelConversion {
  id: string;
  selectedFuelId: string | null;
  unit: string;
  amount: string;
  energyMWh: number;
}

const UNIT_OPTIONS = {
  solid: ['kg', 't', 'g'],
  liquid: ['L', 'm³', 'kg'],
  gaseous: ['m³', 'kg', 'L']
};

const FuelConverter = () => {
  const navigate = useNavigate();
  const [conversions, setConversions] = useState<FuelConversion[]>([
    { id: '1', selectedFuelId: null, unit: '', amount: '', energyMWh: 0 }
  ]);

  const addConversion = useCallback(() => {
    const newConversion: FuelConversion = {
      id: Date.now().toString(),
      selectedFuelId: null,
      unit: '',
      amount: '',
      energyMWh: 0
    };
    setConversions(prev => [...prev, newConversion]);
  }, []);

  const removeConversion = useCallback((id: string) => {
    if (conversions.length > 1) {
      setConversions(prev => prev.filter(c => c.id !== id));
    }
  }, [conversions.length]);

  const updateConversion = useCallback((id: string, field: keyof FuelConversion, value: any) => {
    setConversions(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        
        // Reset unit when fuel changes
        if (field === 'selectedFuelId') {
          updated.unit = '';
          updated.amount = '';
        }
        
        // Recalculate energy when relevant fields change
        if (field === 'selectedFuelId' || field === 'amount' || field === 'unit') {
          updated.energyMWh = calculateEnergy(updated);
        }
        
        return updated;
      }
      return c;
    }));
  }, []);

  const calculateEnergy = (conversion: FuelConversion): number => {
    if (!conversion.selectedFuelId || !conversion.amount || !conversion.unit) return 0;
    
    const fuel = FUEL_DATABASE.find(f => f.id === conversion.selectedFuelId);
    if (!fuel) return 0;
    
    const amount = parseFloat(conversion.amount);
    if (isNaN(amount) || amount <= 0) return 0;
    
    let amountInKg = 0;
    
    // Convert to kg based on unit and fuel type
    switch (conversion.unit) {
      case 'kg':
        amountInKg = amount;
        break;
      case 't':
        amountInKg = amount * 1000;
        break;
      case 'g':
        amountInKg = amount / 1000;
        break;
      case 'L':
        if (fuel.state === 'Liquid' && fuel.density) {
          amountInKg = amount * fuel.density;
        } else if (fuel.state === 'Gaseous' && fuel.density) {
          amountInKg = amount * fuel.density;
        } else {
          return 0; // Can't convert volume without density
        }
        break;
      case 'm³':
        if (fuel.state === 'Liquid' && fuel.density) {
          amountInKg = amount * fuel.density * 1000; // L to m³ conversion for liquids
        } else if (fuel.state === 'Gaseous' && fuel.density) {
          amountInKg = amount * fuel.density;
        } else {
          return 0; // Can't convert volume without density
        }
        break;
      default:
        return 0;
    }
    
    if (amountInKg <= 0) return 0;
    
    // Convert to Gg (1 Gg = 1,000,000 kg)
    const amountInGg = amountInKg / 1000000;
    
    // Calculate energy in TJ (NCV is in TJ/Gg)
    const energyTJ = amountInGg * fuel.ncv;
    
    // Convert TJ to MWh (1 TJ = 277.778 MWh)
    return energyTJ * 277.778;
  };

  const totalRenewableEnergy = conversions.reduce((total, conv) => {
    const fuel = FUEL_DATABASE.find(f => f.id === conv.selectedFuelId);
    return total + (fuel?.renewability === 'Renewable' ? conv.energyMWh : 0);
  }, 0);

  const totalNonRenewableEnergy = conversions.reduce((total, conv) => {
    const fuel = FUEL_DATABASE.find(f => f.id === conv.selectedFuelId);
    return total + (fuel?.renewability === 'Non-renewable' ? conv.energyMWh : 0);
  }, 0);

  const totalEnergy = totalRenewableEnergy + totalNonRenewableEnergy;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to VSME Form
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Fuel Converter</h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-6 bg-accent/20 border-2 border-accent/30 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-accent-foreground mb-2">Disclaimer</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This converter is intended solely to illustrate how energy consumption (in MWh) can be calculated from various fuel types.
            EFRAG assumes no responsibility or liability for the content or for any direct, indirect, or incidental consequences or damages
            resulting from the use of this fuel converter. The typical values for Net Calorific Value (NCV) and Density are provided for
            each fuel type, but may vary depending on factors such as national regulations or specific fuel characteristics.
          </p>
        </div>

        <div className="space-y-6">
          {conversions.map((conversion, index) => {
            const selectedFuel = FUEL_DATABASE.find(f => f.id === conversion.selectedFuelId);
            const availableUnits = selectedFuel ? UNIT_OPTIONS[selectedFuel.state.toLowerCase() as keyof typeof UNIT_OPTIONS] : [];

            return (
              <Card key={conversion.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Fuel Conversion {index + 1}</CardTitle>
                  {conversions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeConversion(conversion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`fuel-${conversion.id}`}>What is your fuel?</Label>
                      <Select
                        value={conversion.selectedFuelId || ''}
                        onValueChange={(value) => updateConversion(conversion.id, 'selectedFuelId', value)}
                      >
                        <SelectTrigger id={`fuel-${conversion.id}`}>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {FUEL_DATABASE.map(fuel => (
                            <SelectItem key={fuel.id} value={fuel.id}>
                              {fuel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedFuel && (
                      <>
                        <div>
                          <Label>State of matter</Label>
                          <Input value={selectedFuel.state} readOnly className="bg-muted" />
                        </div>

                        <div>
                          <Label>Typical renewability state</Label>
                          <Input value={selectedFuel.renewability} readOnly className="bg-muted" />
                        </div>

                        <div>
                          <Label htmlFor={`unit-${conversion.id}`}>Unit of measurement</Label>
                          <Select
                            value={conversion.unit}
                            onValueChange={(value) => updateConversion(conversion.id, 'unit', value)}
                          >
                            <SelectTrigger id={`unit-${conversion.id}`}>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUnits.map(unit => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`amount-${conversion.id}`}>Amount</Label>
                          <Input
                            id={`amount-${conversion.id}`}
                            type="number"
                            value={conversion.amount}
                            onChange={(e) => updateConversion(conversion.id, 'amount', e.target.value)}
                            placeholder="Enter amount"
                          />
                        </div>

                        <div>
                          <Label>Energy [MWh]</Label>
                          <Input
                            value={conversion.energyMWh.toFixed(4)}
                            readOnly
                            className="bg-muted font-mono"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-center">
            <Button onClick={addConversion} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Fuel Conversion
            </Button>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Total Energy Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Total Energy [MWh]</Label>
                  <Input
                    value={totalEnergy.toFixed(4)}
                    readOnly
                    className="bg-muted font-mono font-bold"
                  />
                </div>
                <div>
                  <Label>Total Renewable Energy [MWh]</Label>
                  <Input
                    value={totalRenewableEnergy.toFixed(4)}
                    readOnly
                    className="bg-muted font-mono"
                  />
                </div>
                <div>
                  <Label>Total Non-renewable Energy [MWh]</Label>
                  <Input
                    value={totalNonRenewableEnergy.toFixed(4)}
                    readOnly
                    className="bg-muted font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FuelConverter;