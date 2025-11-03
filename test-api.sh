#!/bin/bash

# Test script for M8 AE2 REST Server
# Primero debes tener el server corriendo. Revisa el README para más detalles.

BASE_URL="http://localhost:3000"

# Function to beautify the messages in the test.
print_test_header() {
    local message="$1"
    local max_width=90  # Maximum total width
    local blank_prefix="     "
    
    # Calculate message length
    local message_len=${#message}
    local blank_prefix_len=${#blank_prefix}
    
    # Available space for the entire content (excluding blank_prefix)
    local content_width=$((max_width - blank_prefix_len))
    
    # Minimum padding: "=   " + message + "   ="
    local min_padding=8
    
    # Check if message fits with minimum padding
    if [ $((message_len + min_padding)) -gt $content_width ]; then
        # Truncate message if too long
        local max_message_len=$((content_width - min_padding))
        message="${message:0:$max_message_len}"
        message_len=${#message}
    fi
    
    # Calculate total padding space available (content_width - message_len)
    local total_padding=$((content_width - message_len))
    
    # Reserve 6 characters for minimum spacing: "=   " and "   ="
    local equals_space=$((total_padding - 6))
    local equals_per_side=$((equals_space / 2))
    local extra_space=$((equals_space % 2))
    
    # Build prefix: "=" + equals + "   "
    local prefix="="
    for ((i=0; i<equals_per_side; i++)); do
        prefix+="="
    done
    prefix+="   "
    
    # Build suffix: "   " + equals + "="
    local suffix="   "
    for ((i=0; i<equals_per_side; i++)); do
        suffix+="="
    done
    # Add extra space to right side if needed
    if [ $extra_space -eq 1 ]; then
        suffix+="="
    fi
    suffix+="="
    
    # Create the complete content line
    local content_line="${prefix}${message}${suffix}"
    local content_len=${#content_line}
    
    # Create blue stripe to match exact content length
    local blue_stripe="${blank_prefix}\033[44m$(printf '%*s' $content_len '')\033[0m"
    
    echo -e "$blue_stripe"
    echo -e "${blank_prefix}\033[44m${content_line}\033[0m"
    echo -e "$blue_stripe"
}

# Function to pause and clear screen between tests
pause_and_clear() {
    echo
    read -t 10 -p $'\033[1;5;33mComenzando en 10 segundos... (Enter para continuar inmediatamente)\033[0m '
    clear
}

clear
echo
echo -e "\033[93m     ================================================================================="
echo -e "     ===                                                                           ==="
echo -e "     ===             TEST SUITE PARA EL M8 AE2 REST SERVER - TODOS API             ==="
echo -e "     ===                                                                           ==="
echo -e "     =================================================================================\033[0m"
echo

echo -e "\033[3;93m     Esta suite de pruebas testea automáticamente cada uno de los endpoints disponibles"
echo -e "     disponibles en la API a través de 20 tests."
echo -e
echo -e "     Tras cada request, dispones de 10 segundos para mirar el resultado en detalle y"
echo -e "     luego continuará automáticamente al siguiente endpoint."
echo -e
echo -e "     Si no quieres esperar, simplemente presiona cualquier tecla para avanzar.\033[0m"
echo

read -t 10 -p $'\033[1;5mComenzando en 10 segundos... (Enter para continuar inmediatamente)\033[0m '
clear

# -------------------------- 1 --------------------------
print_test_header "1. TESTEEMOS EL ENDPOINT RAÍZ (GET /)"
curl -s "$BASE_URL/" | jq .
pause_and_clear

# -------------------------- 2 --------------------------
print_test_header "2. TESTEANDO get all todos (GET /api/todos)"
curl -s "$BASE_URL/api/todos" | jq .
pause_and_clear

# -------------------------- 3 --------------------------
print_test_header "3. Creando la primera tarea (POST /api/todos)"
curl -X POST "$BASE_URL/api/todos" \
  -H "Content-Type: application/json" \
  -d '{"message": "Estudiar para el examen TD", "completed": false}' | jq .
pause_and_clear

# -------------------------- 4 --------------------------
print_test_header "4. Creando otra tarea (POST /api/todos - completed):"
RESPONSE=$(curl -X POST "$BASE_URL/api/todos" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hacer ejercicio (nah mentira!! Comer una pizzita 😋).", "completed": true}')
echo "$RESPONSE" | jq .
TODO_ID=$(echo "$RESPONSE" | jq -r '.data.id // empty')
echo "Created todo with ID: $TODO_ID"
pause_and_clear

# -------------------------- 5 --------------------------
print_test_header "5. Verificamos las tareas creadas (GET /api/todos)"
curl -s "$BASE_URL/api/todos" | jq .
pause_and_clear

# -------------------------- 6 --------------------------
print_test_header "6. Obteniendo una tarea por ID (GET /api/todos/:id):"
curl "$BASE_URL/api/todos/$TODO_ID" | jq .
pause_and_clear

# -------------------------- 7 --------------------------
print_test_header "7. Actualizando tarea (PUT /api/todos/:id):"
curl -X PUT "$BASE_URL/api/todos/$TODO_ID" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hacer ejercicio por la mañana. Weno, ahora si.", "completed": false}' | jq .
pause_and_clear

# -------------------------- 8 --------------------------
print_test_header "8. Un update parcial - solo el campo completed (PUT /api/todos/:id):"
curl -X PUT "$BASE_URL/api/todos/$TODO_ID" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}' | jq .
pause_and_clear

# -------------------------- 9 --------------------------
print_test_header "9. Testing un POST inválido - sin message (POST /api/todos):"
curl -X POST "$BASE_URL/api/todos" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
pause_and_clear

# -------------------------- 10 -------------------------
print_test_header "10. Obteniendo una tarea inexistente (GET /api/todos/nonexistent):"
curl "$BASE_URL/api/todos/nonexistent" | jq .
pause_and_clear

# -------------------------- 11 -------------------------
print_test_header "11. Creando tercera tarea (POST /api/todos):"
THIRD_TODO_RESPONSE=$(curl -X POST "$BASE_URL/api/todos" \
  -H "Content-Type: application/json" \
  -d '{"message": "Comprar víveres", "completed": false}')
echo "$THIRD_TODO_RESPONSE" | jq .
THIRD_TODO_ID=$(echo "$THIRD_TODO_RESPONSE" | jq -r '.data.id // empty')
echo "Created third todo with ID: $THIRD_TODO_ID"
pause_and_clear

# -------------------------- 12 -------------------------
print_test_header "12. Eliminando la tercera tarea (DELETE /api/todos/:id):"
curl -X DELETE "$BASE_URL/api/todos/$THIRD_TODO_ID" | jq .
pause_and_clear

# -------------------------- 13 -------------------------
print_test_header "13. Estado final - Obteniendo todas las tareas (GET /api/todos):"
curl "$BASE_URL/api/todos" | jq .
pause_and_clear

# ------------- QUERY PARAMETER ENDPOINTS TESTS ----------

# -------------------------- 14 -------------------------
print_test_header "14. Obteniendo tarea específica con query param (GET /api/todos?id=$FIRST_TODO_ID):"
curl "$BASE_URL/api/todos?id=$FIRST_TODO_ID" | jq .
pause_and_clear

# -------------------------- 15 -------------------------
print_test_header "15. Obteniendo tarea específica con query param (GET /api/todos?id=$SECOND_TODO_ID):"
curl "$BASE_URL/api/todos?id=$SECOND_TODO_ID" | jq .
pause_and_clear

# -------------------------- 16 -------------------------
print_test_header "16. Query param con ID inexistente (GET /api/todos?id=99999):"
curl "$BASE_URL/api/todos?id=99999" | jq .
pause_and_clear

# -------------------------- 17 -------------------------
print_test_header "17. Eliminando tarea con query param (DELETE /api/todos/query?id=$SECOND_TODO_ID):"
curl -X DELETE "$BASE_URL/api/todos/query?id=$SECOND_TODO_ID" | jq .
pause_and_clear

# -------------------------- 18 -------------------------
print_test_header "18. Verificando eliminación con query param (GET /api/todos?id=$SECOND_TODO_ID):"
curl "$BASE_URL/api/todos?id=$SECOND_TODO_ID" | jq .
pause_and_clear

# -------------------------- 19 -------------------------
print_test_header "19. Eliminando con query param - ID inexistente (DELETE /api/todos/query?id=99999):"
curl -X DELETE "$BASE_URL/api/todos/query?id=99999" | jq .
pause_and_clear

# -------------------------- 20 -------------------------
print_test_header "20. Testing 404 route (GET /nonexistent/route):"
curl "$BASE_URL/nonexistent/route" | jq .
pause_and_clear

# --------------------- FINISHING -----------------------
read -p $'\033[31mTodas las pruebas completadas. ¿Quieres eliminar la data en la BD? (y/n).\033[0m' confirm
if [[ $confirm == [yY] ]]; then
    echo -e "\033[1;31mEliminando todas las tareas (DELETE /api/todos/purge)...\033[0m"
    sleep 2
    curl -X DELETE "$BASE_URL/api/todos/purge" | jq .
    echo -e "\033[1;31mTodos los registros fueron eliminados.\033[0m"
    sleep 6
else
    echo -e "\033[1;33mData no eliminada. Puedes revisar la base de datos manualmente si lo deseas.\033[0m"
fi 
clear