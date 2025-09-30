import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversionFactor {
  [key: string]: number;
}

interface UnitCategory {
  name: string;
  units: string[];
  baseUnit: string;
  conversionFactors: ConversionFactor;
}

const UNIT_CATEGORIES: UnitCategory[] = [
  {
    name: 'Mass',
    units: ['kg', 'g', 't', 'lb', 'oz'],
    baseUnit: 'kg',
    conversionFactors: {
      'kg': 1,
      'g': 0.001,
      't': 1000,
      'lb': 0.453592,
      'oz': 0.0283495
    }
  },
  {
    name: 'Volume',
    units: ['L', 'mL', 'm³', 'gal', 'ft³'],
    baseUnit: 'L',
    conversionFactors: {
      'L': 1,
      'mL': 0.001,
      'm³': 1000,
      'gal': 3.78541,
      'ft³': 28.3168
    }
  },
  {
    name: 'Energy Consumption per Hour',
    units: ['MWh', 'kWh', 'Wh', 'TJ', 'GJ', 'BTU'],
    baseUnit: 'MWh',
    conversionFactors: {
      'MWh': 1,
      'kWh': 0.001,
      'Wh': 0.000001,
      'TJ': 277.778,
      'GJ': 0.277778,
      'BTU': 0.000000293071
    }
  },
  {
    name: 'Density',
    units: ['kg/L', 'kg/m³', 'g/mL', 'g/L', 'lb/gal', 'lb/ft³'],
    baseUnit: 'kg/L',
    conversionFactors: {
      'kg/L': 1,
      'kg/m³': 0.001,
      'g/mL': 1,
      'g/L': 0.001,
      'lb/gal': 0.119826,
      'lb/ft³': 0.0160185
    }
  },
  {
    name: 'NCV (Net Calorific Value)',
    units: ['TJ/Gg', 'MJ/kg', 'kJ/kg', 'BTU/lb', 'cal/g'],
    baseUnit: 'TJ/Gg',
    conversionFactors: {
      'TJ/Gg': 1,
      'MJ/kg': 1,
      'kJ/kg': 0.001,
      'BTU/lb': 0.002326,
      'cal/g': 0.004184
    }
  }
];

interface Conversion {
  id: string;
  category: string;
  fromUnit: string;
  toUnit: string;
  fromValue: string;
  toValue: string;
}

const UnitConverter = () => {
  const navigate = useNavigate();
  const [conversions, setConversions] = useState<Conversion[]>([
    { id: '1', category: '', fromUnit: '', toUnit: '', fromValue: '', toValue: '' }
  ]);

  const updateConversion = useCallback((id: string, field: keyof Conversion, value: string) => {
    setConversions(prev => prev.map(conv => {
      if (conv.id === id) {
        const updated = { ...conv, [field]: value };
        
        // Reset units when category changes
        if (field === 'category') {
          updated.fromUnit = '';
          updated.toUnit = '';
          updated.fromValue = '';
          updated.toValue = '';
        }
        
        // Recalculate when fromValue, fromUnit, or toUnit changes
        if (field === 'fromValue' || field === 'fromUnit' || field === 'toUnit') {
          updated.toValue = calculateConversion(updated);
        }
        
        return updated;
      }
      return conv;
    }));
  }, []);

  const calculateConversion = (conversion: Conversion): string => {
    if (!conversion.category || !conversion.fromUnit || !conversion.toUnit || !conversion.fromValue) {
      return '';
    }
    
    const category = UNIT_CATEGORIES.find(cat => cat.name === conversion.category);
    if (!category) return '';
    
    const fromValue = parseFloat(conversion.fromValue);
    if (isNaN(fromValue)) return '';
    
    const fromFactor = category.conversionFactors[conversion.fromUnit];
    const toFactor = category.conversionFactors[conversion.toUnit];
    
    if (!fromFactor || !toFactor) return '';
    
    // Convert to base unit, then to target unit
    const baseValue = fromValue * fromFactor;
    const convertedValue = baseValue / toFactor;
    
    return convertedValue.toFixed(6);
  };

  const addConversion = useCallback(() => {
    const newConversion: Conversion = {
      id: Date.now().toString(),
      category: '',
      fromUnit: '',
      toUnit: '',
      fromValue: '',
      toValue: ''
    };
    setConversions(prev => [...prev, newConversion]);
  }, []);

  const removeConversion = useCallback((id: string) => {
    if (conversions.length > 1) {
      setConversions(prev => prev.filter(c => c.id !== id));
    }
  }, [conversions.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to VSME Form
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Unit of Measurement Converter</h1>
        </div>

        <div className="space-y-6">
          {UNIT_CATEGORIES.map((category, categoryIndex) => {
            const conversion = conversions.find(c => c.category === category.name) || conversions[0];
            
            return (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Unit of measurement of {category.name} Converter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <Label htmlFor={`from-unit-${category.name}`}>From</Label>
                      <Select
                        value={conversion?.category === category.name ? conversion.fromUnit : ''}
                        onValueChange={(value) => {
                          // Set category if not set
                          if (conversion?.category !== category.name) {
                            updateConversion(conversion?.id || '1', 'category', category.name);
                          }
                          updateConversion(conversion?.id || '1', 'fromUnit', value);
                        }}
                      >
                        <SelectTrigger id={`from-unit-${category.name}`}>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {category.units.map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`from-value-${category.name}`}>Value</Label>
                      <Input
                        id={`from-value-${category.name}`}
                        type="number"
                        value={conversion?.category === category.name ? conversion.fromValue : ''}
                        onChange={(e) => {
                          if (conversion?.category !== category.name) {
                            updateConversion(conversion?.id || '1', 'category', category.name);
                          }
                          updateConversion(conversion?.id || '1', 'fromValue', e.target.value);
                        }}
                        placeholder="Enter value"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>

                    <div>
                      <Label htmlFor={`to-unit-${category.name}`}>To</Label>
                      <Select
                        value={conversion?.category === category.name ? conversion.toUnit : ''}
                        onValueChange={(value) => {
                          if (conversion?.category !== category.name) {
                            updateConversion(conversion?.id || '1', 'category', category.name);
                          }
                          updateConversion(conversion?.id || '1', 'toUnit', value);
                        }}
                      >
                        <SelectTrigger id={`to-unit-${category.name}`}>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {category.units.map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`to-value-${category.name}`}>Result</Label>
                      <Input
                        id={`to-value-${category.name}`}
                        value={conversion?.category === category.name ? conversion.toValue : ''}
                        readOnly
                        className="bg-gray-50 font-mono"
                        placeholder="Result"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Usage Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Select the unit category you want to convert (Mass, Volume, Energy, etc.)</li>
            <li>2. Choose the "From" unit from the dropdown</li>
            <li>3. Enter the value you want to convert</li>
            <li>4. Select the "To" unit from the dropdown</li>
            <li>5. The result will be automatically calculated and displayed</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;