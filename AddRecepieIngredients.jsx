import React, { useState, useCallback, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Textarea,
  Card,
  CardItem,
  Body,
  Item,
  Label,
  Input,
  Picker,
  Icon,
} from "native-base";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const AddRecepieIngredients = (props) => {
  const { setIngredientsArray, ingredientsArray } = props;
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("0");
  const [selectedUnit, setSetectedUnit] = useState("nos");
  const [ingrError, setIngrError] = useState(false);
  const [quantError, setQuantError] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [ingrNum, setIngrNum] = useState(null);

  const addIngredientNameHandler = (enteredText) => {
    if (enteredText.trim().length > 0) {
      setIngrError(false);
    } else {
      setIngrError(true);
    }
    setIngredientName(enteredText);
  };

  const addQuantityHandler = (enteredQuantity) => {
    if (selectedUnit === "toTaste") {
      setQuantError(false);
      setIngredientQuantity("0");
    } else {
      if (
        enteredQuantity.trim().length > 0 &&
        !isNaN(enteredQuantity) &&
        Number(enteredQuantity) > 0
      ) {
        setQuantError(false);
      } else {
        setQuantError(true);
      }
      setIngredientQuantity(enteredQuantity);
    }
  };

  const addMethodArrayHandler = () => {
    if (
      !ingrError &&
      !quantError &&
      ingredientName.length > 0 &&
      ingredientQuantity.length > 0 &&
      !isNaN(ingredientQuantity) &&
      Number(ingredientQuantity) > 0
    ) {
      if (isEdit) {
        const id = ingrNum;
        const newArray = [...ingredientsArray];
        const elementedIndex = ingredientsArray.findIndex(
          (rec) => rec.id == id
        );

        newArray[elementedIndex] = {
          ...newArray[elementedIndex],
          name: ingredientName,
          quantity: ingredientQuantity,
          unit: selectedUnit,
        };

        setIngredientsArray(newArray);
      } else {
        setIngredientsArray((currentIngredients) => [
          ...currentIngredients,
          {
            id: ingredientsArray.length + 1,
            name: ingredientName,
            quantity: ingredientQuantity,
            unit: selectedUnit,
          },
        ]);
      }

      setIngredientName("");
      setIngredientQuantity("");
      setSetectedUnit("nos");
      setIngrError(false);
      setQuantError(false);
      setIsEdit(false);
      setIngrNum(null);
    } else {
      //console.log(ingrError, quantError);
      setIngrError(ingredientName.length > 0 ? false : true);
      setQuantError(ingredientQuantity.length > 0 ? false : true);
    }
  };

  const updateIngredient = () => {
    //console.log(elementedIndex);
  };

  const handleDelete = (id) => {
    const tempArray = ingredientsArray.filter((rec) => rec.id != id);
    setIngredientsArray(tempArray);
    // console.log("Clicked", id);
  };

  const handleEdit = (id) => {
    const tempArray = ingredientsArray.filter((rec) => rec.id == id);

    //setIngredientsArray(tempArray);
    setIngredientName(tempArray[0].name);
    setIngredientQuantity(tempArray[0].quantity);
    setSetectedUnit(tempArray[0].unit);
    setIsEdit(true);
    setIngrNum(id);
    //console.log("Clicked:------", tempname);
  };

  const rightOption = (ingr) => {
    //console.log(ingr);
    return (
      <View
        style={{ flex: 0, flexDirection: "row", justifyContent: "flex-end" }}
      >
        <TouchableOpacity onPress={() => handleDelete(ingr)}>
          <View
            style={{
              //backgroundColor: "red",
              flex: 1,
              justifyContent: "center",
              padding: 3,
              marginBottom: 4,
              marginTop: 4,
              borderRadius: 5,
            }}
          >
            <MaterialIcons name="delete" size={24} color="black" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit(ingr)}>
          <View
            style={{
              //backgroundColor: "green",
              flex: 1,
              justifyContent: "center",
              padding: 3,
              marginBottom: 4,
              marginTop: 4,
              borderRadius: 5,
            }}
          >
            <AntDesign name="edit" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View>
        <Item stackedLabel>
          <Label>Ingredients</Label>
          <Input
            onChangeText={addIngredientNameHandler}
            value={ingredientName}
          />
        </Item>
        {ingrError && (
          <Text style={{ color: "red" }}>Please enter ingredient name.</Text>
        )}
        <View style={styles.inputBox}>
          <View style={{ width: "60%" }}>
            <Item stackedLabel>
              <Label>Quantity</Label>
              <Input
                keyboardType="numeric"
                maxLength={6}
                onChangeText={addQuantityHandler}
                value={ingredientQuantity}
              />
            </Item>
            {quantError && (
              <Text style={{ color: "red" }}>
                Please enter ingredient quantity.
              </Text>
            )}
          </View>
          <Picker
            mode="dropdown"
            iosHeader="Select Unit"
            iosIcon={<Icon name="arrow-down" />}
            style={{ width: undefined }}
            selectedValue={selectedUnit}
            onValueChange={(value) => setSetectedUnit(value)}
          >
            <Picker.Item label="Cup" value="Cup" />
            <Picker.Item label="mg" value="mg" />
            <Picker.Item label="ml" value="ml" />
            <Picker.Item label="gms" value="gms" />
            <Picker.Item label="tsp" value="tsp" />
            <Picker.Item label="tbsp" value="tbsp" />
            <Picker.Item label="nos" value="nos" />
            <Picker.Item label="To taste" value="toTaste" />
          </Picker>
        </View>

        <Button
          title={isEdit ? "Update Ingredient" : "Add Ingredient"}
          onPress={addMethodArrayHandler}
        />
      </View>
      <ScrollView>
        {ingredientsArray.map((ingredient, index) => (
          <Swipeable
            renderRightActions={() => rightOption(ingredient.id)}
            key={index}
          >
            <Card>
              <CardItem>
                <Body>
                  <View style={styles.inputBox}>
                    <View style={{ width: "80%" }}>
                      <Text>{ingredient.name}</Text>
                    </View>
                    <View>
                      {ingredient.unit === "toTaste" ? (
                        <Text>To Taste</Text>
                      ) : (
                        <Text>
                          {ingredient.quantity ? ingredient.quantity : "0"}{" "}
                          {ingredient.unit}
                        </Text>
                      )}
                    </View>
                  </View>
                </Body>
              </CardItem>
            </Card>
          </Swipeable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignContent: "center",
    alignItems: "center",
  },
});

export default AddRecepieIngredients;
